import logging
from datetime import datetime

from opentelemetry import trace

from common.database import ServiceSettings, db_context
from tasks.handlers.models import Response

from .shared import MessageTriggerType, send_incomplete_message

manual = True

logger = logging.getLogger(__name__)


async def handler(participant_id: int, kind: str, at: datetime) -> Response:
    trace.get_current_span().set_attribute("user.id", participant_id)

    async with db_context() as db:
        accepting_applications = await ServiceSettings.accepting_applications(db).get()
        if not accepting_applications:
            logger.info("registration disabled, not sending reminder")
            return Response.success()

    # Check if we need to delay allowing for some jitter
    delta = at - datetime.utcnow()
    if delta.total_seconds() > 5:
        return Response.delay_for(delta.total_seconds())

    # Decode the kind
    if kind == "24h":
        trigger = MessageTriggerType.INCOMPLETE_APPLICATION_24H
    elif kind == "7d":
        trigger = MessageTriggerType.INCOMPLETE_APPLICATION_7D
    else:
        return Response.failure(f"unknown incomplete kind {kind!r}")

    # Send the message
    await send_incomplete_message(participant_id, trigger)

    return Response.success()
