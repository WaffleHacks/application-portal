from opentelemetry import trace

from .shared import WebhookTrigger, send_application_event

event = "registration.accepted"


async def handler(participant_id: int):
    trace.get_current_span().set_attribute("user.id", participant_id)

    await send_application_event(
        WebhookTrigger.APPLICATION_ACCEPTED,
        "application_accepted",
        participant_id,
    )
