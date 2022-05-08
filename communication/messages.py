from http import HTTPStatus
from typing import List, Set

from fastapi import APIRouter, Depends, HTTPException
from mailer import AsyncClient, BodyType
from pydantic import validate_model
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import Select, or_

from common import SETTINGS
from common.authentication import with_user_id
from common.database import (
    Application,
    Group,
    Message,
    MessageCreate,
    MessageList,
    MessageRead,
    MessageUpdate,
    Participant,
    Recipient,
    RecipientCreate,
    RecipientRead,
    with_db,
)
from common.mail import with_mail
from common.permissions import Permission, requires_permission

from .util import send_message

router = APIRouter()


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
async def create(values: MessageCreate, db: AsyncSession = Depends(with_db)):
    """
    Creates a new message, but does not send it
    """

    # Create the message
    message = Message.from_orm(values)

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
async def update(id: int, values: MessageUpdate, db: AsyncSession = Depends(with_db)):
    """
    Update the contents and recipients of a message.
    """
    message = await db.get(Message, id, options=[selectinload(Message.recipients)])
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Update the recipients
    if values.recipients:
        # Remove all old recipients
        for r in message.recipients:
            await db.delete(r)

        # Add new recipients
        for group in values.recipients:
            db.add(Recipient(group=group, message=message))

    # Update the rest of the fields
    updated_fields = values.dict(exclude_unset=True, exclude={"recipients"})
    for key, value in updated_fields.items():
        setattr(message, key, value)

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
    mailer: AsyncClient = Depends(with_mail),
    db: AsyncSession = Depends(with_db),
):
    """
    Send a message to all the recipients
    """
    message = await db.get(Message, id, options=[selectinload(Message.recipients)])
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Retrieve all the recipient emails
    groups = {r.group for r in message.recipients}
    result = await db.execute(recipients_query(groups))
    participants = result.all()

    emails = {}
    for row in participants:
        emails[row[2]] = {"first_name": row[0], "last_name": row[1]}

    await mailer.send_template(
        emails,
        SETTINGS.communication.sender,
        message.subject,
        message.content,
        body_type=BodyType.HTML,
        reply_to=SETTINGS.communication.reply_to,
    )


@router.post(
    "/{id}/test",
    name="Send test message",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def send_test(
    id: int,
    user_id: str = Depends(with_user_id),
    mailer: AsyncClient = Depends(with_mail),
    db: AsyncSession = Depends(with_db),
):
    """
    Test the message by sending it to the requester
    """
    message = await db.get(Message, id)
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Get the current user
    user = await db.get(Participant, user_id)
    assert user is not None

    await send_message(user, message, mailer)


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


def recipients_query(groups: Set[Group]) -> Select:
    """
    Generate the query for recipients when sending emails. Also performs some simple optimizations.
    :param groups: the recipient groups for the message
    :returns: a SQL query
    """
    fields = [Participant.first_name, Participant.last_name, Participant.email]

    # All application statues and all application completion states can be simplified to everyone
    if (
        Group.EVERYONE in groups
        or groups == Group.completion_states()
        or groups == Group.statuses()
    ):
        return select(*fields)

    status_filter = Application.status.in_(  # type: ignore
        [g.to_status() for g in groups if g.to_status() is not None]
    )
    base = select(*fields).outerjoin(Application, full=True)

    # If filtering for complete, status does not matter
    if Group.APPLICATION_COMPLETE in groups:
        return base.where(Application.participant_id != None)

    # Add extra filter for incomplete
    elif Group.APPLICATION_INCOMPLETE in groups:
        return base.where(or_(status_filter, Application.participant_id == None))

    # Only filter on status
    else:
        return base.where(status_filter)
