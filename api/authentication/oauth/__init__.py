from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.session import Session, with_oauth, with_session
from api.settings import SETTINGS
from common.database import Participant, Provider, with_db

from .client import OAuthClient

router = APIRouter()
client = OAuthClient()


@router.get("/launch/{slug}", name="Start OAuth flow")
async def launch(
    slug: str,
    db: AsyncSession = Depends(with_db),
    session: Session = Depends(with_session),
) -> RedirectResponse:
    provider = await db.get(Provider, slug)
    if provider is None or not provider.enabled:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    url, state = provider.build_redirect_url(
        f"{SETTINGS.public_url}/auth/oauth/callback"
    )

    session.into_oauth(state, provider.slug)

    response = RedirectResponse(url)
    await session.set_cookie(response)
    return response


@router.get("/callback", name="Finish OAuth flow")
async def callback(
    state: str,
    code: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: AsyncSession = Depends(with_db),
    session: Session = Depends(with_oauth),
) -> RedirectResponse:
    if session.state != state:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="state mismatch")

    if error is not None or code is None:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=f"login failed: {error} - {error_description}",
        )

    # If an OAuth session was in-flight, finish it even if the provider was disabled
    provider = await db.get(Provider, session.provider)
    if provider is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    token = await client.exchange(code, SETTINGS.public_url, provider)
    user_info = await client.user_info(token, provider)

    # Try to find the user by email
    result = await db.execute(
        select(Participant).where(Participant.email == user_info.email)
    )
    participant: Optional[Participant] = result.scalars().first()

    # Redirect to the frontend and let it handle the state
    response = RedirectResponse(SETTINGS.app_url)

    # Authenticate the user, or mark their profile as incomplete if they don't exist
    if participant is not None:
        session.into_authenticated(participant.id)
    else:
        session.into_incomplete_profile(user_info.email)

    await session.set_cookie(response)
    return response
