from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response
from opentelemetry import trace
from pydantic import BaseModel
from sqlalchemy import func, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.helpers import require_application_accepted
from api.permissions import Role, requires_role
from api.session import with_user_id
from common.database import (
    Event,
    EventAttendance,
    Feedback,
    FeedbackCreate,
    Participant,
    ServiceSettings,
    SwagTier,
    with_db,
)

router = APIRouter(
    dependencies=[
        Depends(requires_role(Role.Participant)),
        Depends(require_application_accepted),
    ]
)
tracer = trace.get_tracer(__name__)


class ParticipantEvent(BaseModel):
    code: str
    name: str
    link: Optional[str]


@router.get(
    "/{code}",
    name="Get participant event details",
    response_model=ParticipantEvent,
)
async def redirect(
    code: str,
    tasks: BackgroundTasks,
    user_id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Mark the participant as having attended and get event details for the participant
    """
    event = await get_event_by_code(code, db)
    response = dict(code=event.code, name=event.name, link=event.link)

    if event.track_attendance:
        # Check that the code is still valid
        if not event.can_mark_attendance:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="invalid code")

        try:
            attendance = EventAttendance(event_id=event.id, participant_id=user_id)

            db.add(attendance)
            await db.commit()

            # Only update tier when attendance successfully marked
            tasks.add_task(update_swag_tier, id=user_id, db=db)
        except IntegrityError:
            # Already marked attendance, all good
            pass

    return response


class StatusResponse(BaseModel):
    submitted: bool


@router.get(
    "/{code}/feedback",
    name="Check feedback submitted",
    response_model=StatusResponse,
)
async def status(
    code: str,
    user_id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Check if the requester has already submitted feedback for the specified event
    """
    event = await get_event_by_code(code, db)
    if not event.can_submit_feedback:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="invalid code")

    statement = (
        select(Feedback)
        .where(Feedback.event_id == event.id)
        .where(Feedback.participant_id == user_id)
        .limit(1)
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
    user_id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Submit feedback for an event
    """
    event = await get_event_by_code(code, db)
    if not event.can_submit_feedback:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="invalid code")

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
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="invalid code")

    return event


async def update_swag_tier(id: int, db: AsyncSession):
    """
    Update the participant's swag tier
    """
    with tracer.start_as_current_span("update-swag-tier"):
        # Find the total number of events the participant has attended
        events_attended_query = (
            select(func.count())
            .select_from(EventAttendance)
            .where(EventAttendance.participant_id == id)
        )

        # Get the corresponding tier
        tier_query = (
            select(SwagTier.id)
            .where(
                SwagTier.required_attendance <= events_attended_query.scalar_subquery()
            )
            .order_by(SwagTier.required_attendance.desc())  # type: ignore
            .limit(1)
        )

        # Update the tier on the participant
        statement = (
            update(Participant)
            .where(Participant.id == id)
            .values(swag_tier_id=tier_query.scalar_subquery())
        )
        await db.execute(statement)

    with tracer.start_as_current_span("check-in"):
        if await ServiceSettings.can_check_in(db):
            await db.execute(
                update(Participant).values(checked_in=True).where(Participant.id == id)
            )

    await db.commit()
