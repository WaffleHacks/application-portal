from opentelemetry import trace

from .shared import MessageTriggerType, send_triggered_message

event = "registration.rejected"


async def handler(participant_id: int):
    trace.get_current_span().set_attribute("user.id", participant_id)

    await send_triggered_message(
        participant_id,
        MessageTriggerType.APPLICATION_REJECTED,
    )
