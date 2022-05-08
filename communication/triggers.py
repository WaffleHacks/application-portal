from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common.database import (
    MessageTrigger,
    MessageTriggerRead,
    MessageTriggerType,
    MessageTriggerUpdate,
    with_db,
)

router = APIRouter()


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

    trigger.message_id = values.message_id

    try:
        db.add(trigger)
        await db.commit()
    except IntegrityError:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="message not found",
        )
