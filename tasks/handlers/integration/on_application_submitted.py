import logging

from opentelemetry import trace
from sqlalchemy.orm import selectinload

from common.database import Application, ApplicationRead, db_context

from .shared import SETTINGS, DiscordPayload, Event, WebhookTrigger, send

event = "registration.new_application"

logger = logging.getLogger(__name__)


class ApplicationSubmitted(Event):
    name = "application_submitted"
    application: ApplicationRead

    def generate_discord_message(self, message: DiscordPayload):
        participant = self.application.participant
        school = self.application.school

        embed = message.add_embed(
            title="New Application",
            url=f"{SETTINGS.app_url}/applications/{participant.id}",
        )

        embed.add_field(
            "Name", f"{participant.first_name} {participant.last_name}", inline=False
        )
        embed.add_field(
            name="School",
            value=f"[{school.name}]({SETTINGS.app_url}/schools/{school.id})",
        )
        embed.add_field("Level of Study", self.application.level_of_study)
        embed.add_field("Country", self.application.country, inline=False)


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
        WebhookTrigger.APPLICATION_SUBMITTED,
        ApplicationSubmitted(application=application),
    )
