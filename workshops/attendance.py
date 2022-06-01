from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.authentication import with_user_id
from common.database import (
    Event,
    EventAttendance,
    require_application_accepted,
    with_db,
)
from common.permissions import Permission, requires_permission

router = APIRouter(
    dependencies=[
        Depends(requires_permission(Permission.Participant)),
        Depends(require_application_accepted),
    ]
)


@router.put("/{code}", name="Mark attendance", status_code=HTTPStatus.NO_CONTENT)
async def mark(
    code: str,
    user_id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Mark the participant as having attended the event by its code
    """
    statement = select(Event).where(Event.code == code)
    result = await db.execute(statement)
    event: Optional[Event] = result.scalars().first()

    if event is None:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="invalid attendance code",
        )

    try:
        attendance = EventAttendance(event_id=event.id, participant_id=user_id)

        db.add(attendance)
        await db.commit()
    except IntegrityError:
        # Already marked their attendance, all good
        pass
