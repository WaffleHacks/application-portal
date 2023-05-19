import binascii
import hmac
import json
import logging
import time
from datetime import datetime
from typing import List, Optional, Union

from aiohttp import ClientError, ClientSession, ClientTimeout
from opentelemetry import trace
from opentelemetry.trace import StatusCode
from pydantic import BaseModel, Field, HttpUrl, validator
from pydantic.json import pydantic_encoder
from sqlalchemy.future import select

from common import version
from common.database import Webhook, WebhookFormat, WebhookTrigger, db_context
from tasks.settings import SETTINGS

shared = True

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

_session: Optional[ClientSession] = None


class Event(BaseModel):
    name: str
    timestamp: int = Field(default_factory=time.time_ns)

    def discord(self) -> str:
        payload = DiscordPayload()
        self.generate_discord_message(payload)
        return json.dumps(payload, default=pydantic_encoder)

    def generate_discord_message(self, message: "DiscordPayload"):
        raise NotImplementedError("to_discord must be implemented on subclass")


async def send(trigger: Union[int, WebhookTrigger], payload: Event):
    """
    Send the given payload to all the enabled webhooks
    """
    client = await _get_client()

    bodies = {
        WebhookFormat.JSON: payload.json(),
        WebhookFormat.DISCORD: payload.discord(),
    }

    webhooks = await webhooks_for(trigger)
    for webhook in webhooks:
        with tracer.start_as_current_span("send") as span:
            body = bodies[webhook.format]
            headers = {}

            if webhook.secret:
                with tracer.start_as_current_span("sign"):
                    digest = hmac.digest(
                        webhook.secret.encode(), body.encode(), "sha256"
                    )
                    headers["X-Request-Signature"] = binascii.hexlify(digest).decode()

            try:
                await client.post(webhook.url, data=body, headers=headers)
            except ClientError as e:
                logger.warning(f"failed to send webhook: {e}")
                span.record_exception(e)
                span.set_status(StatusCode.ERROR)


async def webhooks_for(trigger: Union[int, WebhookTrigger]) -> List[Webhook]:
    """
    Get all the enabled webhooks for a given trigger
    """
    async with db_context() as db:
        statement = (
            select(Webhook)
            .where(Webhook.enabled)
            .where(Webhook.triggered_by.op("&")(trigger) == trigger)  # type: ignore
        )
        result = await db.execute(statement)
        return result.scalars().all()


async def _get_client() -> ClientSession:
    global _session

    if _session is None:
        _session = ClientSession(
            timeout=ClientTimeout(total=5),
            headers={
                "Content-Type": "application/json",
                "User-Agent": f"application-portal/{version.commit}",
            },
        )

    return _session


class DiscordEmbedAuthor(BaseModel):
    name: str = "WaffleHacks"
    url: Optional[HttpUrl] = SETTINGS.app_url
    icon_url: Optional[HttpUrl] = SETTINGS.embed_icon_url


class DiscordEmbedField(BaseModel):
    name: str
    value: str
    inline: bool = True


class DiscordEmbedFooter(BaseModel):
    text: str
    icon_url: Optional[HttpUrl]


class DiscordEmbed(BaseModel):
    title: str
    description: Optional[str]
    url: Optional[HttpUrl]

    # Default color: #58b9ff
    color: int = 5814783

    author: DiscordEmbedAuthor = DiscordEmbedAuthor()
    fields: List[DiscordEmbedField] = []
    footer: Optional[DiscordEmbedFooter]

    timestamp: datetime = Field(default_factory=datetime.utcnow)

    def set_author(
        self,
        name: str,
        url: Optional[Union[HttpUrl, str]] = None,
        icon_url: Optional[Union[HttpUrl, str]] = None,
    ):
        self.author = DiscordEmbedAuthor(name=name, url=url, icon_url=icon_url)

    def set_footer(self, text: str, icon_url: Optional[Union[HttpUrl, str]] = None):
        self.footer = DiscordEmbedFooter(text=text, icon_url=icon_url)

    def add_field(self, name: str, value: str, inline: bool = True):
        self.fields.append(DiscordEmbedField(name=name, value=value, inline=inline))

    @validator("color", allow_reuse=True)
    def color_from_hex(cls, value) -> int:
        if isinstance(value, int):
            return value
        elif isinstance(value, str):
            return int(value, 16)

        return value


class DiscordPayload(BaseModel):
    username: Optional[str]
    avatar_url: Optional[HttpUrl]

    content: Optional[str]

    embeds: List[DiscordEmbed] = []

    def add_embed(
        self,
        title: str,
        description: Optional[str] = None,
        url: Optional[Union[HttpUrl, str]] = None,
        color: Union[str, int] = 5814783,
    ) -> DiscordEmbed:
        embed = DiscordEmbed(title=title, description=description, url=url, color=color)
        self.embeds.append(embed)
        return embed
