from string import Template
from typing import TYPE_CHECKING

from celery import shared_task
from celery.utils.log import get_task_logger
from mailer import BodyType
from sqlalchemy.orm import selectinload

from common import SETTINGS
from common.database import Application, MessageTrigger, MessageTriggerType, db_context
from common.mail import client as mailer
from common.tasks import syncify

if TYPE_CHECKING:
    from logging import Logger

logger = get_task_logger(__name__)  # type: Logger


@syncify
async def send_triggered_message(id: str, trigger_type: MessageTriggerType):
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

        # Get the user's application
        application = await db.get(
            Application,
            id,
            options=[selectinload(Application.participant)],
        )
        if application is None:
            logger.warning(f"application '{id}' no longer exists")
            return

    template = Template(trigger.message.content)
    content = template.safe_substitute(
        first_name=application.participant.first_name,
        last_name=application.participant.last_name,
    )

    # Send the message
    await mailer.send(
        to_email=application.participant.email,
        from_email=SETTINGS.communication.sender,
        subject=trigger.message.subject,
        body=content,
        body_type=BodyType.HTML,
        reply_to=SETTINGS.communication.reply_to,
    )


@shared_task()
def on_apply(id: str):
    send_triggered_message(id, MessageTriggerType.APPLICATION_SUBMITTED)


@shared_task()
def on_application_accepted(id: str):
    send_triggered_message(id, MessageTriggerType.APPLICATION_ACCEPTED)


@shared_task()
def on_application_rejected(id: str):
    send_triggered_message(id, MessageTriggerType.APPLICATION_REJECTED)
