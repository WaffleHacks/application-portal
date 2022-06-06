from http import HTTPStatus
from typing import List, Tuple

from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import validate_model
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common.authentication import with_user_id
from common.database import (
    Group,
    Message,
    MessageCreate,
    MessageList,
    MessageRead,
    MessageStatus,
    MessageUpdate,
    Recipient,
    RecipientCreate,
    RecipientRead,
    with_db,
)
from common.mjml import MJMLClient, with_mjml
from common.permissions import Permission, requires_permission
from common.tasks import tasks

router = APIRouter()
tracer = trace.get_tracer(__name__)


@router.get(
    "/",
    name="List messages",
    response_model=List[MessageList],
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the messages in the database
    """
    statement = select(Message).order_by(Message.created_at.desc())  # type: ignore
    result = await db.execute(statement)
    return result.scalars().all()


@router.post(
    "/",
    name="Create message",
    response_model=MessageRead,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def create(
    values: MessageCreate,
    db: AsyncSession = Depends(with_db),
    mjml: MJMLClient = Depends(with_mjml),
):
    """
    Creates a new message, but does not send it
    """

    # Convert the body from MJML to HTML if needed
    rendered, is_html = await render_mjml(values.content, mjml)

    # Create the message
    message = Message.from_orm(
        values,
        update={"rendered": rendered, "is_html": is_html},
    )

    # Attach the recipients
    recipients = [Recipient(group=g) for g in values.recipients]
    message.recipients = recipients

    db.add(message)
    await db.commit()

    return message


@router.get(
    "/{id}",
    name="Read message",
    response_model=MessageRead,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def read(id: int, db: AsyncSession = Depends(with_db)):
    """
    Read a message from the database
    """
    message = await db.get(Message, id, options=[selectinload(Message.recipients)])
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return message


@router.patch(
    "/{id}",
    name="Update message",
    response_model=MessageRead,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def update(
    id: int,
    values: MessageUpdate,
    db: AsyncSession = Depends(with_db),
    mjml: MJMLClient = Depends(with_mjml),
):
    """
    Update the contents and recipients of a message.
    """
    message = await db.get(Message, id, options=[selectinload(Message.recipients)])
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Update the recipients
    if values.recipients:
        with tracer.start_as_current_span("update-recipients"):
            # Remove all old recipients
            for r in message.recipients:
                await db.delete(r)

            # Add new recipients
            for group in values.recipients:
                db.add(Recipient(group=group, message=message))

    # Update the content
    if values.content:
        with tracer.start_span("update-content"):
            rendered, is_html = await render_mjml(values.content, mjml)
            message.rendered = rendered
            message.is_html = is_html

    # Update the rest of the fields
    with tracer.start_as_current_span("update-fields"):
        updated_fields = values.dict(exclude_unset=True, exclude={"recipients"})
        for key, value in updated_fields.items():
            setattr(message, key, value)

    with tracer.start_as_current_span("validate"):
        *_, error = validate_model(Message, message.__dict__)
        if error:
            raise error

    db.add(message)
    await db.commit()

    await db.refresh(message)
    return message


@router.post(
    "/{id}/recipients",
    name="Add recipient",
    response_model=RecipientRead,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def add_recipient(
    id: int, group: RecipientCreate, db: AsyncSession = Depends(with_db)
):
    """
    Add a recipient to the specified message
    """
    message = await db.get(Message, id)
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    try:
        recipient = Recipient.from_orm(group, update={"message_id": id})

        db.add(recipient)
        await db.commit()

        return recipient
    except IntegrityError:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="recipient already added"
        )


@router.delete(
    "/{id}/recipients/{group}",
    name="Delete recipient",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def delete_recipient(id: int, group: Group, db: AsyncSession = Depends(with_db)):
    """
    Delete a recipient from the specified message
    """
    recipient = await db.get(Recipient, {"message_id": id, "group": group})
    if recipient is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    await db.delete(recipient)
    await db.commit()


@router.post(
    "/{id}/send",
    name="Send message",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def send(
    id: int,
    db: AsyncSession = Depends(with_db),
):
    """
    Send a message to all the recipients
    """
    message = await db.get(Message, id, options=[selectinload(Message.recipients)])
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    if message.status == MessageStatus.DRAFT:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="cannot send draft messages",
        )

    await tasks.communication.send(message_id=id)


@router.post(
    "/{id}/test",
    name="Send test message",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def send_test(
    id: int,
    user_id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Test the message by sending it to the requester
    """
    message = await db.get(Message, id)
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    await tasks.communication.send_test(message_id=message.id, user_id=user_id)


@router.delete(
    "/{id}",
    name="Delete message",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a message from the database
    """
    message = await db.get(Message, id)
    if message:
        await db.delete(message)
        await db.commit()


async def render_mjml(source: str, client: MJMLClient) -> Tuple[str, bool]:
    """
    Call to the MJML API to render the message
    :param source: content that might be MJML
    :param client: the MJML API client
    :returns: rendered MJML or plain text with a boolean denoting if it is HTML
    """
    with tracer.start_as_current_span("render"):
        trimmed_source = source.strip()
        if not (
            trimmed_source.startswith("<mjml>") and trimmed_source.endswith("</mjml>")
        ):
            return source, False

        return await client.render(source), True
