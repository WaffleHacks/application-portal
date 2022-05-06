from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common.database import (
    Group,
    Message,
    MessageCreate,
    MessageList,
    MessageRead,
    MessageUpdate,
    Recipient,
    RecipientCreate,
    RecipientRead,
    with_db,
)

router = APIRouter()


@router.get("/", name="List messages", response_model=List[MessageList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the messages in the database
    """
    statement = select(Message).order_by(Message.created_at.desc())  # type: ignore
    result = await db.execute(statement)
    return result.scalars().all()


@router.post("/", name="Create message", response_model=MessageRead)
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


@router.get("/{id}", name="Read message", response_model=MessageRead)
async def read(id: int, db: AsyncSession = Depends(with_db)):
    """
    Read a message from the database
    """
    message = await db.get(Message, id, options=[selectinload(Message.recipients)])
    if message is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return message


@router.patch("/{id}", name="Update message", response_model=MessageRead)
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


@router.post("/{id}/recipients", name="Add recipient", response_model=RecipientRead)
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


@router.delete("/{id}", name="Delete message", status_code=HTTPStatus.NO_CONTENT)
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a message from the database
    """
    message = await db.get(Message, id)
    if message:
        await db.delete(message)
        await db.commit()
