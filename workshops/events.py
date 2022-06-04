from http import HTTPStatus
from typing import List

import nanoid
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.database import (
    Event,
    EventCreate,
    EventList,
    EventRead,
    EventUpdate,
    Feedback,
    FeedbackRead,
    with_db,
)
from common.permissions import Permission, requires_permission

router = APIRouter(dependencies=[Depends(requires_permission(Permission.Organizer))])
tracer = trace.get_tracer(__name__)


@router.get("/", name="List workshops", response_model=List[EventList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all workshops
    """
    result = await db.execute(select(Event))
    return result.scalars().all()


@router.post("/", name="Create workshop", response_model=EventList)
async def create(params: EventCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new workshop
    """
    workshop = Event.from_orm(params, {"code": nanoid.generate(size=8)})

    db.add(workshop)
    await db.commit()

    return workshop


@router.get("/{id}", name="Read workshop", response_model=EventRead)
async def read(id: int, db: AsyncSession = Depends(with_db)):
    """
    Get all the details about a workshop
    """
    workshop = await db.get(
        Event,
        id,
        options=[
            selectinload(Event.feedback).selectinload(Feedback.participant),
            selectinload(Event.attendees),
        ],
    )
    if workshop is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return workshop


@router.get(
    "/{event_id}/feedback/{user_id}",
    name="Read detailed workshop feedback",
    response_model=FeedbackRead,
)
async def read_feedback(
    event_id: int, user_id: str, db: AsyncSession = Depends(with_db)
):
    """
    Get the detailed feedback for a given participant
    """
    workshop = await db.get(
        Event,
        event_id,
        options=[selectinload(Event.feedback).selectinload(Feedback.participant)],
    )
    if workshop is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    with tracer.start_as_current_span("find-feedback"):
        for f in workshop.feedback:
            if f.participant_id == user_id:
                f.event = f.event  # I have no idea why this is needed
                return f

    raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")


@router.patch("/{id}", name="Update workshop", status_code=HTTPStatus.NO_CONTENT)
async def update(id: int, params: EventUpdate, db: AsyncSession = Depends(with_db)):
    """
    Update the details of a workshop
    """
    workshop = await db.get(Event, id)
    if workshop is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    with tracer.start_as_current_span("update"):
        updated_fields = params.dict(exclude_unset=True)
        for key, value in updated_fields.items():
            setattr(workshop, key, value)

    with tracer.start_as_current_span("validate"):
        *_, error = validate_model(Event, workshop.__dict__)
        if error:
            raise error

    db.add(workshop)
    await db.commit()


@router.delete("/{id}", name="Delete workshop", status_code=HTTPStatus.NO_CONTENT)
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a workshop
    """
    workshop = await db.get(Event, id)
    if workshop:
        await db.delete(workshop)
        await db.commit()
