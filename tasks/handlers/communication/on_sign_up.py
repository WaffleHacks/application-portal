from datetime import datetime, timedelta

from opentelemetry import trace

from common.tasks import tasks

from .shared import MessageTriggerType, send_triggered_message

event = "sync.sign_up"


async def handler(participant_id: str):
    trace.get_current_span().set_attribute("user.id", participant_id)

    # Send the message
    await send_triggered_message(participant_id, MessageTriggerType.SIGN_UP)

    # Schedule the incomplete reminder tasks
    now = datetime.utcnow()
    await tasks.communication.send_incomplete_reminder(
        participant_id=participant_id,
        kind="24h",
        at=now + timedelta(days=1),
    )
    await tasks.communication.send_incomplete_reminder(
        participant_id=participant_id,
        kind="7d",
        at=now + timedelta(days=7),
    )
