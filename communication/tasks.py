from string import Template
from typing import TYPE_CHECKING

from celery import shared_task
from celery.utils.log import get_task_logger
from mailer import BodyType
from sqlalchemy.orm import selectinload

from common import SETTINGS
from common.database import (
    Application,
    MessageTrigger,
    MessageTriggerType,
    Participant,
    db_context,
)
from common.mail import client as mailer
from common.tasks import syncify

if TYPE_CHECKING:
    from logging import Logger

logger = get_task_logger(__name__)  # type: Logger


async def send_triggered_message(
    id: str,
    trigger_type: MessageTriggerType,
):
    """
    Sends a triggered message to the application
    :param id: the participant's ID
    :param getter: a coroutine to fetch the participant's information
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

    template = Template(trigger.message.content)
    content = template.safe_substitute(
        first_name=participant.first_name,
        last_name=participant.last_name,
    )

    # Send the message
    await mailer.send(
        to_email=participant.email,
        from_email=SETTINGS.communication.sender,
        subject=trigger.message.subject,
        body=content,
        body_type=BodyType.HTML,
        reply_to=SETTINGS.communication.reply_to,
    )


@shared_task()
@syncify
async def on_sign_up(id: str):
    await send_triggered_message(id, MessageTriggerType.SIGN_UP)


@shared_task()
@syncify
async def incomplete_after_24h(id: str):
    async with db_context() as db:
        application = await db.get(Application, id)
        if application is not None:
            logger.info(
                f"participant '{id}' completed application within 24hr, not sending reminder"
            )
            return

    await send_triggered_message(id, MessageTriggerType.INCOMPLETE_APPLICATION_24H)


@shared_task()
@syncify
async def incomplete_after_7d(id: str):
    async with db_context() as db:
        application = await db.get(Application, id)
        if application is not None:
            logger.info(
                f"participant '{id}' completed application within 1 week, not sending reminder"
            )
            return

    await send_triggered_message(id, MessageTriggerType.INCOMPLETE_APPLICATION_7D)


@shared_task()
@syncify
async def on_apply(id: str):
    await send_triggered_message(id, MessageTriggerType.APPLICATION_SUBMITTED)


@shared_task()
@syncify
async def on_application_accepted(id: str):
    await send_triggered_message(id, MessageTriggerType.APPLICATION_ACCEPTED)


@shared_task()
@syncify
async def on_application_rejected(id: str):
    await send_triggered_message(id, MessageTriggerType.APPLICATION_REJECTED)
