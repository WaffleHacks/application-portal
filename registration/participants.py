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
async def list_participants(
    db: AsyncSession = Depends(with_db),
) -> List[ParticipantRead]:
    """
    List all the participants in the database
    """
    statement = select(Participant)
    result = await db.execute(statement)
    participants = result.scalars().all()
    return participants


@router.get("/{participant_id}", response_model=ParticipantRead)
async def read_participant(
    participant_id: int, db: AsyncSession = Depends(with_db)
) -> ParticipantRead:
    """
    Get details about an individual participant
    """
    participant = await db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return ParticipantRead.from_orm(participant)


@router.post(
    "/{participant_id}/application",
    response_model=ApplicationRead,
    status_code=HTTPStatus.CREATED,
)
async def create_application(
    participant_id: int, values: ApplicationCreate, db: AsyncSession = Depends(with_db)
) -> ApplicationRead:
    """
    Create a new application attached to the participant
    """
    participant = await db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    application = Application.from_orm(values, {"participant_id": participant_id})
    db.add(application)
    await db.commit()

    return ApplicationRead.from_orm(application)


@router.delete("/{participant_id}", status_code=HTTPStatus.NO_CONTENT)
async def delete_participant(participant_id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a participant and all their associated data
    """
    participant = await db.get(Participant, participant_id)
    if participant:
        await db.delete(participant)
        await db.commit()
