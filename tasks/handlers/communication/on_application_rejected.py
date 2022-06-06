from opentelemetry import trace

from .util import MessageTriggerType, send_triggered_message

event = "registration.rejected"


async def handler(participant_id: str):
    trace.get_current_span().set_attribute("user.id", participant_id)

    await send_triggered_message(
        participant_id,
        MessageTriggerType.APPLICATION_REJECTED,
    )
