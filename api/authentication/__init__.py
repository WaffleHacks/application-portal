from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from api.session import Session, Status, with_session
from api.settings import SETTINGS
from common.database import Participant, ParticipantRead, with_db

from . import oauth, profile

router = APIRouter()
router.include_router(oauth.router, prefix="/oauth", tags=["OAuth"])
router.include_router(profile.router, prefix="/profile", tags=["Profile"])


class Me(BaseModel):
    status: Status

    # Present when status == Status.IncompleteProfile
    email: Optional[str]

    # Present when status == Status.Authenticated
    participant: Optional[ParticipantRead]


@router.get("/me", name="Current user", response_model=Me)
async def me(
    session: Session = Depends(with_session),
    db: AsyncSession = Depends(with_db),
):
    if session.status in {Status.Unauthenticated, Status.OAuth}:
        return Me(status=session.status)

    if session.status == Status.IncompleteProfile:
        return Me(status=session.status, email=session.email)

    if session.status == Status.Authenticated:
        participant = await db.get(Participant, session.id)
        assert participant is not None

        return Me(status=session.status, participant=participant)

    raise ValueError(f"unknown session status {session.status}")


@router.get("/logout", name="Logout")
async def logout() -> RedirectResponse:
    response = RedirectResponse(SETTINGS.app_url)
    response.delete_cookie(
        key="session_id",
        domain=SETTINGS.cookie_domain,
        secure=SETTINGS.cookie_secure,
        httponly=True,
    )
    return response
