from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    Application,
    ApplicationCreate,
    ApplicationRead,
    Participant,
    ParticipantRead,
    with_db,
)

router = APIRouter()


@router.get("/", response_model=List[ParticipantRead])
async def list_participants(db: AsyncSession = Depends(with_db)):
    """
    List all the participants in the database
    """
    statement = select(Participant)
    result = await db.execute(statement)
    participants = result.scalars().all()
    return participants


@router.get("/{id}", response_model=ParticipantRead)
async def read_participant(id: int, db: AsyncSession = Depends(with_db)):
    """
    Get details about an individual participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return participant


@router.post(
    "/{id}/application",
    response_model=ApplicationRead,
    status_code=HTTPStatus.CREATED,
)
async def create_application(
    id: int, values: ApplicationCreate, db: AsyncSession = Depends(with_db)
):
    """
    Create a new application attached to the participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    application = Application.from_orm(values, {"id": id})
    db.add(application)
    await db.commit()

    return application


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT)
async def delete_participant(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a participant and all their associated data
    """
    participant = await db.get(Participant, id)
    if participant:
        await db.delete(participant)
        await db.commit()
