from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common.database import (
    Message,
    MessageCreate,
    MessageList,
    MessageRead,
    Recipient,
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

    # Re-fetch the message to prevent implicit I/O
    return await db.get(Message, message.id, options=[selectinload(Message.recipients)])
