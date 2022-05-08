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


@shared_task()
@syncify
async def on_apply(id: str):
    async with db_context() as db:
        # If a trigger for the event is configured, send the email
        trigger = await db.get(
            MessageTrigger,
            MessageTriggerType.APPLICATION_SUBMITTED,
            options=[selectinload(MessageTrigger.message)],
        )
        assert trigger is not None
        if trigger.message is None:
            logger.info(f"no automated message configured for submitted applications")
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

    # TODO: template the message

    # Send the message
    await mailer.send(
        to_email=application.participant.email,
        from_email=SETTINGS.communication.sender,
        subject=trigger.message.subject,
        body=trigger.message.content,
        body_type=BodyType.HTML,
        reply_to=SETTINGS.communication.reply_to,
    )
