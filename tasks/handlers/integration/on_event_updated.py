import logging

from opentelemetry import trace

from common.database import Event, db_context

from .shared import SETTINGS, DiscordPayload
from .shared import Event as BaseEvent
from .shared import WebhookTrigger, send

event = "workshops.updated"

logger = logging.getLogger(__name__)


class WorkshopUpdated(BaseEvent):
    name = "event_updated"
    event: Event

    def generate_discord_message(self, message: DiscordPayload):
        embed = message.add_embed(
            title="Event Updated",
            url=f"{SETTINGS.app_url}/events/{self.event.id}",
        )

        embed.add_field("Name", self.event.name)
        embed.add_field("Code", self.event.code)


async def handler(event_id: int):
    trace.get_current_span().set_attribute("event.id", event_id)

    async with db_context() as db:
        event = await db.get(Event, event_id)
        if event is None:
            logger.warning(f"event '{event_id}' no longer exists")

    await send(WebhookTrigger.WORKSHOP_UPDATED, WorkshopUpdated(event=event))
