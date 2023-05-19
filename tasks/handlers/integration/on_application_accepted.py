import logging

from opentelemetry import trace
from sqlalchemy.orm import selectinload

from common.database import Application, ApplicationRead, db_context

from .shared import SETTINGS, DiscordPayload, Event, WebhookTrigger, send

event = "registration.accepted"

logger = logging.getLogger(__name__)


class ApplicationAccepted(Event):
    name = "application_accepted"
    application: ApplicationRead

    def generate_discord_message(self, message: DiscordPayload):
        participant = self.application.participant

        embed = message.add_embed(
            title="Application Accepted",
            url=f"{SETTINGS.app_url}/applications/{participant.id}",
        )

        embed.add_field("Name", f"{participant.first_name} {participant.last_name}")
        embed.add_field("Email", participant.email)
        if self.application.notes is not None and len(self.application.notes) != 0:
            embed.add_field("Notes", self.application.notes, inline=False)


async def handler(participant_id: int):
    trace.get_current_span().set_attribute("user.id", participant_id)

    async with db_context() as db:
        application = await db.get(
            Application,
            participant_id,
            options=[
                selectinload(Application.participant),
                selectinload(Application.school),
            ],
        )
        if application is None:
            logger.warning(
                f"application for participant '{participant_id}' no longer exists"
            )
            return

    await send(
        WebhookTrigger.APPLICATION_ACCEPTED,
        ApplicationAccepted(application=application),
    )
