import logging
import time

from opentelemetry import trace

from common.database import Participant, ParticipantList, db_context

from .shared import WebhookTrigger, send

event = "authentication.sign_up"

logger = logging.getLogger(__name__)


async def handler(participant_id: int):
    trace.get_current_span().set_attribute("user.id", participant_id)

    async with db_context() as db:
        participant = await db.get(Participant, participant_id)
        if participant is None:
            logger.warning(f"participant '{participant_id}' no longer exists")
            return

    await send(
        WebhookTrigger.SIGN_UP,
        {
            "event": "sign_up",
            "participant": ParticipantList.from_orm(participant),
            "timestamp": int(time.time()),
        },
    )
