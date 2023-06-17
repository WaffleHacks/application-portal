from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.helpers import require_application_accepted, with_current_participant
from api.permissions import Role, requires_role
from common.database import Participant, ParticipantList, with_db

router = APIRouter()


@router.get(
    "/",
    name="Get check-in information",
    dependencies=[Depends(requires_role(Role.Organizer))],
    response_model=List[ParticipantList],
)
async def info(db: AsyncSession = Depends(with_db)):
    """
    Get all the checked-in participants
    """

    result = await db.execute(select(Participant).where(Participant.checked_in))
    participants = result.scalars().all()

    return participants


@router.put(
    "/",
    name="Mark participant as checked in",
    dependencies=[
        Depends(requires_role(Role.Participant)),
        Depends(require_application_accepted),
    ],
    status_code=HTTPStatus.NO_CONTENT,
)
async def mark(
    participant: Participant = Depends(with_current_participant),
    db: AsyncSession = Depends(with_db),
):
    """
    Mark the current participant as checked in
    """

    participant.checked_in = True
    db.add(participant)
    await db.commit()
