from http import HTTPStatus
from typing import List

import nanoid
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from api.permissions import Role, requires_role
from common.database import (
    Event,
    EventCreate,
    EventList,
    EventRead,
    EventReadWithFeedback,
    EventUpdate,
    Feedback,
    with_db,
)
from common.tasks import broadcast

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])
tracer = trace.get_tracer(__name__)


@router.get("/", name="List workshops", response_model=List[EventList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all workshops
    """
    result = await db.execute(select(Event).order_by(Event.valid_from))
    return result.scalars().all()


@router.post("/", name="Create workshop", response_model=EventList)
async def create(params: EventCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new workshop
    """
    workshop = Event.from_orm(params, {"code": nanoid.generate(size=8)})

    db.add(workshop)
    await db.commit()

    await broadcast("workshops", "updated", event_id=workshop.id)

    return workshop


@router.get("/{id}", name="Read workshop", response_model=EventReadWithFeedback)
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


@router.get("/by-code/{code}", name="Read workshop by code", response_model=EventRead)
async def read_by_code(code: str, db: AsyncSession = Depends(with_db)):
    """
    Get all the details about a workshop by it's code
    """
    result = await db.execute(select(Event).where(Event.code == code))
    event = result.scalars().first()

    if event is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return event


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

    await broadcast("workshops", "updated", event_id=workshop.id)


@router.delete("/{id}", name="Delete workshop", status_code=HTTPStatus.NO_CONTENT)
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a workshop
    """
    workshop = await db.get(Event, id)
    if workshop:
        await db.delete(workshop)
        await db.commit()

    await broadcast("workshops", "deleted", event_id=id)
