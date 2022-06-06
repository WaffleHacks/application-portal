from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common.authentication import is_internal
from common.database import ApplicationStatus, Participant, with_db

router = APIRouter()


class CanLinkResponse(BaseModel):
    status: bool


@router.get(
    "/can-link",
    response_model=CanLinkResponse,
    dependencies=[Depends(is_internal)],
    name="Can link?",
)
async def link(id, db: AsyncSession = Depends(with_db)):
    """
    Check if the participant can link their Discord account with their application. Prior to linking their Discord
    account, the participant must have applied and been accepted.
    """
    participant = await db.get(
        Participant, id, options=[selectinload(Participant.application)]
    )

    return {
        "status": (
            participant is not None
            and participant.application is not None
            and participant.application.status == ApplicationStatus.ACCEPTED
        )
    }
