from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    Participant,
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
    current_tier: Optional[int]
    tiers: List[SwagTierListWithDescription]


@router.get(
    "/progress",
    name="Get current progress",
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
    result = await db.execute(select(SwagTier).order_by(SwagTier.required_attendance))
    swag_tiers = result.scalars().all()

    return {"current_tier": participant.swag_tier, "tiers": swag_tiers}
