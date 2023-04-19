from http import HTTPStatus
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.permissions import is_admin
from common.database import Participant, ParticipantList, ParticipantRead, Role, with_db

router = APIRouter(dependencies=[Depends(is_admin)])


@router.get("/", name="List participants", response_model=List[ParticipantList])
async def list(db: AsyncSession = Depends(with_db)):
    result = await db.execute(select(Participant))
    participants = result.scalars().all()
    return participants


@router.get("/{id}", name="Read participant", response_model=ParticipantRead)
async def read(id: int, db: AsyncSession = Depends(with_db)):
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return participant


class PermissionsUpdate(BaseModel):
    role: Optional[Role]
    is_admin: Optional[bool]


@router.put("/{id}/permissions", name="Set permissions", response_model=ParticipantList)
async def update_permissions(
    id: int,
    update: PermissionsUpdate,
    db: AsyncSession = Depends(with_db),
):
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    if update.is_admin is not None:
        participant.is_admin = update.is_admin
    if update.role is not None:
        participant.role = update.role

    db.add(participant)
    await db.commit()

    await db.refresh(participant)
    return participant
