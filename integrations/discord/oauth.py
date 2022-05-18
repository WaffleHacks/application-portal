from authlib.integrations.starlette_client import OAuth, StarletteOAuth2App
from starlette.config import Config

from common import SETTINGS

# Register the provider
config = Config(
    environ={
        "DISCORD_CLIENT_ID": SETTINGS.integrations.discord_client_id,
        "DISCORD_CLIENT_SECRET": SETTINGS.integrations.discord_client_secret,
    }
)
oauth = OAuth(config)
oauth.register(
    "discord",
    api_base_url="https://discord.com/api/",
    access_token_url="https://discord.com/api/oauth2/token",
    authorize_url="https://discord.com/api/oauth2/authorize",
    userinfo_endpoint="https://discord.com/api/users/%40me",
    client_kwargs={
        "token_endpoint_auth_method": "client_secret_post",
        "scope": "identify",
    },
)


async def with_oauth() -> StarletteOAuth2App:
    """
    Get a Discord OAuth 2.0 client
    """
    return oauth.create_client("discord")
