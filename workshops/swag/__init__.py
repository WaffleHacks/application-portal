from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.database import (
    Application,
    EventAttendance,
    Participant,
    ParticipantRead,
    Status,
    SwagTier,
    SwagTierListWithDescription,
    require_application_accepted,
    with_current_participant,
    with_db,
)
from common.permissions import Permission, requires_permission

from . import tiers

router = APIRouter()

router.include_router(tiers.router, prefix="/tiers")


class SwagStatus(BaseModel):
    attended: int
    current_tier: Optional[int]
    tiers: List[SwagTierListWithDescription]


@router.get(
    "/progress",
    name="Get current progress",
    response_model=SwagStatus,
    dependencies=[
        Depends(requires_permission(Permission.Participant)),
        Depends(require_application_accepted),
    ],
)
async def progress(
    participant: Participant = Depends(with_current_participant(load_application=True)),
    db: AsyncSession = Depends(with_db),
):
    """
    Get the current user's progress through the swag tiers
    """
    # Get all the tiers
    result = await db.execute(
        select(SwagTier).order_by(SwagTier.required_attendance.desc())  # type: ignore
    )
    swag_tiers = result.scalars().all()

    result = await db.execute(
        select(func.count())
        .select_from(EventAttendance)
        .where(EventAttendance.participant_id == participant.id)
    )
    attended_events = result.scalar()

    return {
        "attended": attended_events,
        "current_tier": participant.swag_tier_id,
        "tiers": swag_tiers,
    }


@router.get(
    "/participants",
    name="Get progress of all participants",
    response_model=List[ParticipantRead],
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def participant_progresses(db: AsyncSession = Depends(with_db)):
    """
    Get the tiers of all accepted participants
    """
    result = await db.execute(
        select(Participant)
        .outerjoin(SwagTier)
        .join(Application)
        .where(Application.status == Status.ACCEPTED)
        .order_by(SwagTier.required_attendance, Participant.first_name)  # type: ignore
        .options(selectinload(Participant.swag_tier))
    )
    return result.scalars().all()
