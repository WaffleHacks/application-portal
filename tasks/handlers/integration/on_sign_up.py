import logging

from opentelemetry import trace

from common.database import Participant, ParticipantList, db_context

from .shared import DiscordPayload, Event, WebhookTrigger, send

event = "authentication.sign_up"

logger = logging.getLogger(__name__)


class SignUp(Event):
    name = "sign_up"
    participant: ParticipantList

    def generate_discord_message(self, message: DiscordPayload):
        embed = message.add_embed(title="New Sign Up")

        embed.add_field(
            name="Name",
            value=f"{self.participant.first_name} {self.participant.last_name}",
        )
        embed.add_field("Email", self.participant.email)
        embed.add_field("Role", self.participant.role.name, inline=False)


async def handler(participant_id: int):
    trace.get_current_span().set_attribute("user.id", participant_id)

    async with db_context() as db:
        participant = await db.get(Participant, participant_id)
        if participant is None:
            logger.warning(f"participant '{participant_id}' no longer exists")
            return

    await send(WebhookTrigger.SIGN_UP, SignUp(participant=participant))
