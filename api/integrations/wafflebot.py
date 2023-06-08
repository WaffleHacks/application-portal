from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from api.settings import SETTINGS
from common.database import Application, ApplicationStatus, Participant, with_db

token_scheme = HTTPBearer()


def requires_key(key: HTTPAuthorizationCredentials = Depends(token_scheme)):
    """
    Check that the provided bearer token is valid
    """
    if key.credentials != SETTINGS.wafflebot_key:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")


router = APIRouter(dependencies=[Depends(requires_key)])


class StatusResponse(BaseModel):
    status: Optional[ApplicationStatus]


@router.get(
    "/status",
    name="Check participant application status",
    response_model=StatusResponse,
)
async def check_status(email: str, db: AsyncSession = Depends(with_db)):
    """
    Lookup a participant's application status by email
    """
    result = await db.execute(
        select(Participant)
        .where(Participant.email == email)
        .options(selectinload(Participant.application))
    )
    participant: Optional[Participant] = result.scalar_one_or_none()

    if participant is None or participant.application is None:
        return StatusResponse(status=None)

    return StatusResponse(status=participant.application.status)
