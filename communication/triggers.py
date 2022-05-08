from http import HTTPStatus
from string import Template
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from mailer import BodyType
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common import SETTINGS
from common.authentication import with_user_id
from common.database import (
    MessageTrigger,
    MessageTriggerRead,
    MessageTriggerType,
    MessageTriggerUpdate,
    Participant,
    with_db,
)
from common.mail import AsyncClient, with_mail
from common.permissions import Permission, requires_permission

from .util import send_message

router = APIRouter()


@router.get(
    "/",
    name="List triggers",
    response_model=List[MessageTriggerRead],
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get all the message triggers used for automated events
    """
    statement = select(MessageTrigger).options(selectinload(MessageTrigger.message))
    result = await db.execute(statement)
    return result.scalars().all()


@router.put(
    "/{type}",
    name="Set trigger",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
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


@router.post(
    "/{type}/test",
    name="Test trigger",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def test(
    type: MessageTriggerType,
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
    mailer: AsyncClient = Depends(with_mail),
):
    """
    Test sending a trigger message to the current user
    """
    trigger = await db.get(
        MessageTrigger, type, options=[selectinload(MessageTrigger.message)]
    )
    assert trigger is not None

    # Ensure there is a message to send
    if trigger.message is None:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="no message configured"
        )

    # Get the user info
    user = await db.get(Participant, id)
    assert user is not None

    # Send the message
    await send_message(user, trigger.message, mailer)
