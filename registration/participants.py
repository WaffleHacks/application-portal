from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import Participant, ParticipantRead, with_db
from common.permissions import Permission, requires_permission

router = APIRouter()


@router.get(
    "/",
    response_model=List[ParticipantRead],
    name="List Participants",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def list(db: AsyncSession = Depends(with_db)):
    """
    List all the participants in the database
    """
    statement = select(Participant)
    result = await db.execute(statement)
    participants = result.scalars().all()
    return participants


@router.get(
    "/{id}",
    response_model=ParticipantRead,
    name="Read participant",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def read(id: str, db: AsyncSession = Depends(with_db)):
    """
    Get details about an individual participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return participant


@router.delete(
    "/{id}",
    status_code=HTTPStatus.NO_CONTENT,
    name="Delete participant",
    dependencies=[Depends(requires_permission(Permission.Director))],
)
async def remove(id: str, db: AsyncSession = Depends(with_db)):
    """
    Delete a participant and all their associated data
    """
    async with db.begin():
        statement = delete(Participant).where(Participant.id == id)
        await db.execute(statement)
