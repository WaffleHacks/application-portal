import logging
from string import Template

from mailer import AsyncClient, BodyType
from opentelemetry import trace
from sqlalchemy.orm import selectinload

from common import SETTINGS
from common.database import (
    Application,
    Message,
    MessageTrigger,
    MessageTriggerType,
    Participant,
    db_context,
)

shared = True

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

mailer = AsyncClient(SETTINGS.tasks.mailer)


async def send_message(recipient: Participant, message: Message):
    """
    Send a templated message to the specified recipient
    :param recipient: who the message should be sent to
    :param message: the message to send
    """
    with tracer.start_as_current_span("send"):
        with tracer.start_as_current_span("render"):
            template = Template(message.rendered)
            content = template.safe_substitute(
                first_name=recipient.first_name,
                last_name=recipient.last_name,
            )

        # Send the message
        await mailer.send(
            to_email=recipient.email,
            from_email=SETTINGS.tasks.sender,
            subject=message.subject,
            body=content,
            body_type=BodyType.HTML if message.is_html else BodyType.PLAIN,
            reply_to=SETTINGS.tasks.reply_to,
        )


async def send_triggered_message(
    id: str,
    trigger_type: MessageTriggerType,
):
    """
    Sends a triggered message to the application
    :param id: the participant's ID
    :param trigger_type: the type of trigger to send
    """
    async with db_context() as db:
        # If a trigger for the event is configured, send the email
        trigger = await db.get(
            MessageTrigger,
            trigger_type,
            options=[selectinload(MessageTrigger.message)],
        )
        assert trigger is not None
        if trigger.message is None:
            logger.info(f"no automated message configured for {trigger_type.name}")
            return

        # Get the participant's information
        participant = await db.get(Participant, id)
        if participant is None:
            logger.warning(f"participant '{id}' no longer exists")
            return

    await send_message(participant, trigger.message)


async def send_incomplete_message(id: str, trigger_type: MessageTriggerType):
    span = trace.get_current_span()

    async with db_context() as db:
        application = await db.get(Application, id)
        if application is not None:
            span.set_attribute("complete", True)
            logger.info(
                f"participant '{id}' completed application within 24hr, not sending reminder"
            )
            return

    span.set_attribute("complete", False)
    await send_triggered_message(id, trigger_type)
