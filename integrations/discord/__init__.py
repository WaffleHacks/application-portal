from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import URL, RedirectResponse

from common import SETTINGS
from common.authentication import with_user_id
from common.database import DiscordLink, with_db
from common.permissions import Permission, requires_permission

from .oauth import StarletteOAuth2App, with_oauth

router = APIRouter()


@router.get(
    "/link",
    dependencies=[Depends(requires_permission(Permission.Participant))],
)
async def link(
    request: Request,
    id: str = Depends(with_user_id),
    client: StarletteOAuth2App = Depends(with_oauth),
):
    """
    Initiate the OAuth 2.0 login flow for Discord
    """
    request.session["id"] = id

    # Add reverse proxy prefix
    # TODO: figure out a way to make this more robust
    callback_url = request.url_for("link_callback").replace(
        "discord", "integrations/discord"
    )

    return await client.authorize_redirect(request, callback_url)


@router.get(
    "/link/callback",
    status_code=HTTPStatus.TEMPORARY_REDIRECT,
    response_class=RedirectResponse,
)
async def link_callback(
    request: Request,
    code: str = None,
    error: Optional[str] = Query(None),
    client: StarletteOAuth2App = Depends(with_oauth),
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
)
async def unlink(id: str = Depends(with_user_id), db: AsyncSession = Depends(with_db)):
    """
    Unlink a participant's Discord account with their profile
    """

    discord = await db.get(DiscordLink, id)
    if discord is not None:
        await db.delete(discord)
        await db.commit()
