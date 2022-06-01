from http import HTTPStatus
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.authentication import with_user_id
from common.database import Participant, SwagTier, SwagTierListWithDescription, with_db
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
    dependencies=[Depends(requires_permission(Permission.Participant))],
)
async def progress(
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Get the current user's progress through the swag tiers
    """
    participant = await db.get(
        Participant,
        id,
        options=[selectinload(Participant.application)],
    )
    if participant is None:
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="no participant for id",
        )

    # Only allow participants who have applied and been accepted
    if participant.application is None or not participant.application.accepted:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="application must be accepted",
        )

    # Get all the tiers
    result = await db.execute(select(SwagTier).order_by(SwagTier.required_attendance))
    swag_tiers = result.scalars().all()

    return {"current_tier": participant.swag_tier, "tiers": swag_tiers}
