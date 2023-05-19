from opentelemetry import trace

from .shared import WebhookTrigger, send_application_event

event = "registration.new_application"


async def handler(participant_id: int):
    trace.get_current_span().set_attribute("user.id", participant_id)

    await send_application_event(
        WebhookTrigger.APPLICATION_SUBMITTED,
        "application_submitted",
        participant_id,
    )
