from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.authentication import with_user_id
from common.database import (
    Event,
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


class StatusResponse(BaseModel):
    submitted: bool


@router.get(
    "/{event_id}", name="Check feedback submitted", response_model=StatusResponse
)
async def status(
    event_id: int,
    user_id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Check if the requester has already submitted feedback for the specified event
    """
    statement = (
        select(Feedback)
        .where(Feedback.event_id == event_id)
        .where(Feedback.participant_id == user_id)
    )
    result = await db.execute(statement)
    feedback = result.scalars().first()

    return {"submitted": feedback is not None}


@router.put(
    "/{event_id}",
    name="Submit feedback",
    status_code=HTTPStatus.CREATED,
    response_class=Response,
)
async def submit(
    event_id: int,
    params: FeedbackCreate,
    user_id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Submit feedback for an event
    """
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="event not found")

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
