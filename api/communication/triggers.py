from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.permissions import Role, requires_role
from api.session import with_user_id
from common.database import (
    Message,
    MessageStatus,
    MessageTrigger,
    MessageTriggerRead,
    MessageTriggerType,
    MessageTriggerUpdate,
    with_db,
)
from common.tasks import tasks

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])


@router.get("/", name="List triggers", response_model=List[MessageTriggerRead])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get all the message triggers used for automated events
    """
    statement = select(MessageTrigger).options(selectinload(MessageTrigger.message))
    result = await db.execute(statement)
    return result.scalars().all()


@router.put("/{type}", name="Set trigger", status_code=HTTPStatus.NO_CONTENT)
async def update(
    type: MessageTriggerType,
    values: MessageTriggerUpdate,
    db: AsyncSession = Depends(with_db),
):
    """
    Set or unset the message sent on the specified trigger
    """
    trigger = await db.get(MessageTrigger, type)
    assert trigger is not None

    message = await db.get(Message, values.message_id)
    if message is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="message not found"
        )

    if message.status == MessageStatus.DRAFT:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="cannot use drafts messages as triggers",
        )

    trigger.message_id = message.id
    db.add(trigger)
    await db.commit()


@router.post("/{type}/test", name="Test trigger", status_code=HTTPStatus.NO_CONTENT)
async def test(
    type: MessageTriggerType,
    id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Test sending a trigger message to the current user
    """
    trigger = await db.get(MessageTrigger, type)
    assert trigger is not None

    # Ensure there is a message to send
    if trigger.message_id is None:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="no message configured"
        )

    # Send the message
    await tasks.communication.send_test(message_id=trigger.message_id, user_id=id)
