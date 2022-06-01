from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.authentication import with_user_id
from common.database import (
    Event,
    EventAttendance,
    Feedback,
    FeedbackCreate,
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
    event = await get_event_by_code(code, db)

    try:
        attendance = EventAttendance(event_id=event.id, participant_id=user_id)

        db.add(attendance)
        await db.commit()
    except IntegrityError:
        # Already marked their attendance, all good
        pass


class StatusResponse(BaseModel):
    submitted: bool


@router.get(
    "/{code}/feedback",
    name="Check feedback submitted",
    response_model=StatusResponse,
)
async def status(
    code: str,
    user_id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Check if the requester has already submitted feedback for the specified event
    """
    statement = (
        select(Feedback)
        .join(Event)
        .where(Event.code == code)
        .where(Feedback.participant_id == user_id)
    )
    result = await db.execute(statement)
    feedback = result.scalars().first()

    return {"submitted": feedback is not None}


@router.put(
    "/{code}/feedback",
    name="Submit feedback",
    status_code=HTTPStatus.CREATED,
    response_class=Response,
)
async def submit(
    code: str,
    params: FeedbackCreate,
    user_id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Submit feedback for an event
    """
    event = await get_event_by_code(code, db)

    try:
        feedback = Feedback.from_orm(
            params,
            {"event_id": event.id, "participant_id": user_id},
        )

        db.add(feedback)
        await db.commit()
    except IntegrityError:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail="already submitted feedback",
        )


async def get_event_by_code(code: str, db: AsyncSession) -> Event:
    """
    Get an event by its code
    """
    statement = select(Event).where(Event.code == code)
    result = await db.execute(statement)
    event: Optional[Event] = result.scalars().first()

    if event is None:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="invalid attendance code",
        )

    return event
