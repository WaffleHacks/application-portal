from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.authentication import is_internal
from common.database import ApplicationStatus, Participant, with_db

router = APIRouter(dependencies=[Depends(is_internal)])


class StatusResponse(BaseModel):
    id: Optional[str]
    status: Optional[ApplicationStatus]


@router.get(
    "/status",
    response_model=StatusResponse,
    name="Get application status",
)
async def status(email: str, db: AsyncSession = Depends(with_db)):
    """
    Get the current status of a participant's application.
    """
    statement = (
        select(Participant)
        .where(Participant.email == email)
        .options(selectinload(Participant.application))
    )
    result = await db.execute(statement)
    participant: Optional[Participant] = result.scalar()

    if participant is None:
        return {"id": None, "status": None}

    if participant.application is None:
        return {"id": participant.id, "status": None}
    else:
        return {"id": participant.id, "status": participant.application.status}


class CanLinkResponse(BaseModel):
    status: bool


@router.get(
    "/can-link",
    response_model=CanLinkResponse,
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
