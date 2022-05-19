from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.responses import URL, RedirectResponse

from common import SETTINGS
from common.authentication import with_user_id
from common.database import (
    DiscordLink,
    DiscordLinkRead,
    DiscordLinkUpdate,
    Participant,
    Status,
    with_db,
)
from common.permissions import Permission, requires_permission

from .oauth import OAuth2App, with_oauth

router = APIRouter()


@router.get(
    "/link",
    dependencies=[Depends(requires_permission(Permission.Participant))],
    name="Initiate linking",
)
async def link(
    request: Request,
    id: str = Depends(with_user_id),
    client: OAuth2App = Depends(with_oauth),
    db: AsyncSession = Depends(with_db),
):
    """
    Initiate the OAuth 2.0 login flow for Discord. Prior to linking their Discord account, the participant must have
    applied and been accepted.
    """

    # Check the participant has applied and was accepted
    participant = await db.get(
        Participant, id, options=[selectinload(Participant.application)]
    )
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.GONE, detail="non-existent user")
    elif participant.application is None:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="no application")
    elif participant.application.status != Status.ACCEPTED:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="not accepted")

    request.session["id"] = id

    # Add reverse proxy prefix
    # TODO: figure out a way to make this more robust
    callback_url = request.url_for("Complete linking").replace(
        "discord", "integrations/discord"
    )

    return await client.authorize_redirect(request, callback_url)


@router.get(
    "/link/callback",
    status_code=HTTPStatus.TEMPORARY_REDIRECT,
    response_class=RedirectResponse,
    name="Complete linking",
)
async def link_callback(
    request: Request,
    code: str = None,
    error: Optional[str] = Query(None),
    client: OAuth2App = Depends(with_oauth),
    db: AsyncSession = Depends(with_db),
):
    """
    Complete the OAuth 2.0 login flow and link the user's account if successful
    """

    if not code:
        redirect_url = URL(SETTINGS.integrations.link_domain)
        return RedirectResponse(redirect_url.include_query_params(error=error))

    # Get the user's info
    token = await client.authorize_access_token(request)
    user_info = await client.userinfo(token=token)

    # Update or create the link
    discord = await db.get(DiscordLink, request.session["id"])
    if discord is not None:
        discord.id = user_info["id"]
        discord.username = user_info["username"]
        discord.discriminator = user_info["discriminator"]
    else:
        discord = DiscordLink(
            participant_id=request.session["id"],
            id=user_info["id"],
            username=user_info["username"],
            discriminator=user_info["discriminator"],
        )

    db.add(discord)
    await db.commit()

    return RedirectResponse(SETTINGS.integrations.link_domain)


@router.delete(
    "/link",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_permission(Permission.Participant))],
    name="Unlink account",
)
async def unlink(id: str = Depends(with_user_id), db: AsyncSession = Depends(with_db)):
    """
    Unlink a participant's Discord account with their profile
    """

    discord = await db.get(DiscordLink, id)
    if discord is not None:
        await db.delete(discord)
        await db.commit()


@router.get(
    "/profile",
    response_model=DiscordLinkRead,
    dependencies=[Depends(requires_permission(Permission.Participant))],
    name="Get profile",
)
async def profile(id: str = Depends(with_user_id), db: AsyncSession = Depends(with_db)):
    """
    Get a participant's Discord profile
    """

    discord = await db.get(DiscordLink, id)
    if discord is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return discord


@router.patch(
    "/profile",
    response_model=DiscordLinkRead,
    dependencies=[Depends(requires_permission(Permission.Participant))],
    name="Update profile",
)
async def update_profile(
    values: DiscordLinkUpdate,
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Update attributes for a participant's profile
    """

    discord = await db.get(DiscordLink, id)
    if discord is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = values.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(discord, key, value)

    *_, error = validate_model(DiscordLink, discord.__dict__)
    if error:
        raise error

    db.add(discord)
    await db.commit()

    return discord


class CheckResponse(BaseModel):
    linked: bool


# TODO: add authorization for this route
@router.get("/status", response_model=CheckResponse, name="Check linked status")
async def check_status(id: str, db: AsyncSession = Depends(with_db)):
    """
    Check if the given participant has a linked Discord account and agreed to the server rules. This endpoint is only
    intended for use by WaffleBot to check if a participant is allowed to view entire server.
    """

    discord = await db.get(DiscordLink, id)
    return {"linked": discord is not None and discord.agreed_to_rules}
