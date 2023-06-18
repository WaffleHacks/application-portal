import logging

from opentelemetry import trace

from .shared import DiscordPayload
from .shared import Event as BaseEvent
from .shared import WebhookTrigger, send

event = "workshops.deleted"

logger = logging.getLogger(__name__)


class WorkshopDeleted(BaseEvent):
    name = "event_deleted"
    id: int

    def generate_discord_message(self, message: DiscordPayload):
        embed = message.add_embed(title="Event Deleted")
        embed.add_field("ID", str(self.id))


async def handler(event_id: int):
    trace.get_current_span().set_attribute("event.id", event_id)

    await send(WebhookTrigger.WORKSHOP_UPDATED, WorkshopDeleted(id=event_id))
