from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from api.settings import SETTINGS
from common.database import ApplicationStatus, Participant, with_db

token_scheme = HTTPBearer()


def requires_key(key: HTTPAuthorizationCredentials = Depends(token_scheme)):
    """
    Check that the provided bearer token is valid
    """
    if key.credentials != SETTINGS.wafflebot_key:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")


router = APIRouter(dependencies=[Depends(requires_key)])


class StatusResponse(BaseModel):
    id: int
    status: ApplicationStatus


@router.get(
    "/status",
    name="Check participant application status",
    response_model=Optional[StatusResponse],
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
        return None

    return StatusResponse(id=participant.id, status=participant.application.status)


class LookupResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    link: str


@router.get(
    "/lookup",
    name="Lookup a participant's application",
    response_model=Optional[LookupResponse],
)
async def lookup(
    id: Optional[int] = None,
    email: Optional[str] = None,
    db: AsyncSession = Depends(with_db),
):
    """
    Lookup a participant's information by either ID or email. If both are specified, ID takes precedence.
    """
    if id is not None:
        participant = await db.get(Participant, id)
    elif email is not None:
        result = await db.execute(select(Participant).where(Participant.email == email))
        participant = result.scalar_one_or_none()
    else:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="one of id or email is required",
        )

    if participant is None:
        return participant

    return LookupResponse(
        id=participant.id,
        first_name=participant.first_name,
        last_name=participant.last_name,
        email=participant.email,
        link=f"{SETTINGS.app_url}/applications/{participant.id}",
    )
