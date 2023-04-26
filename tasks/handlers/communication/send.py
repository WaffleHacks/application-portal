import logging
from typing import Set

from mailer import Format
from opentelemetry import trace
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import Select, or_

from common.database import (
    Application,
    Group,
    Message,
    MessageStatus,
    Participant,
    db_context,
)
from tasks.settings import SETTINGS

from .shared import mailer

manual = True

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)


async def handler(message_id: int):
    async with db_context() as db:
        # Get the message
        message = await db.get(
            Message,
            message_id,
            options=[selectinload(Message.recipients)],
        )
        if message is None:
            logger.warning(f"message {message_id} no longer exists")
            return

        # Retrieve all the recipient emails
        groups = {r.group for r in message.recipients}
        result = await db.execute(recipients_query(groups))
        participants = result.all()

        with tracer.start_as_current_span("build-context"):
            emails = {}
            for row in participants:
                emails[row[2]] = {"first_name": row[0], "last_name": row[1]}

        await mailer.send_template(
            emails,
            SETTINGS.sender,
            message.subject,
            message.rendered,
            format=Format.HTML if message.is_html else Format.PLAIN,
            reply_to=SETTINGS.reply_to,
        )

        # Mark as sent
        message.status = MessageStatus.SENT
        await db.commit()

        logger.info(f"sent {len(emails)} copies of message {message_id}")


def recipients_query(groups: Set[Group]) -> Select:
    """
    Generate the query for recipients when sending emails. Also performs some simple optimizations.
    :param groups: the recipient groups for the message
    :returns: a SQL query
    """
    fields = [Participant.first_name, Participant.last_name, Participant.email]

    # All application statues and all application completion states can be simplified to everyone
    if (
        Group.EVERYONE in groups
        or groups == Group.completion_states()
        or groups == Group.statuses()
    ):
        return select(*fields)

    status_filter = Application.status.in_(  # type: ignore
        [g.to_status() for g in groups if g.to_status() is not None]
    )
    base = select(*fields).outerjoin(Application, full=True)

    # If filtering for complete, status does not matter
    if Group.APPLICATION_COMPLETE in groups:
        return base.where(Application.participant_id != None)

    # Add extra filter for incomplete
    elif Group.APPLICATION_INCOMPLETE in groups:
        return base.where(or_(status_filter, Application.participant_id == None))

    # Only filter on status
    else:
        return base.where(status_filter)
