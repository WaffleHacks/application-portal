from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.permissions import Role, requires_role
from common.database import Participant, with_db

from . import registration

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])
router.include_router(
    registration.router,
    prefix="/registration",
    tags=["Registration Statistics"],
)


class CheckInStatistics(BaseModel):
    yes: int = 0
    no: int = 0


@router.get("/check-in", name="Check-in statistics", response_model=CheckInStatistics)
async def check_in(db: AsyncSession = Depends(with_db)):
    """
    Get counts of checked-in and not check-in participants
    """

    result = await db.execute(
        (
            select(Participant.checked_in, func.count(Participant.id))
            .where(Participant.checked_in != None)
            .group_by(Participant.checked_in)
        )
    )
    return {("yes" if row.checked_in else "no"): row.count for row in result.all()}
