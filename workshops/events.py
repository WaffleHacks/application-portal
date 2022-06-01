from http import HTTPStatus
from typing import List

import nanoid
from fastapi import APIRouter, Depends, HTTPException
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
    with_db,
)
from common.permissions import Permission, requires_permission

router = APIRouter(dependencies=[Depends(requires_permission(Permission.Organizer))])


@router.get("/", name="List workshops", response_model=List[EventList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all workshops
    """
    result = await db.execute(select(Event))
    return result.scalars().all()


@router.post("/", name="Create workshop", response_model=EventRead)
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


@router.patch("/{id}", name="Update workshop", status_code=HTTPStatus.NO_CONTENT)
async def update(id: int, params: EventUpdate, db: AsyncSession = Depends(with_db)):
    """
    Update the details of a workshop
    """
    workshop = await db.get(Event, id)
    if workshop is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = params.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(workshop, key, value)

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
