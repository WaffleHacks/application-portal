import logging

from opentelemetry import trace

from common.database import Message, Participant, db_context

from .shared import send_message

manual = True

logger = logging.getLogger(__name__)


async def handler(message_id: int, user_id: int):
    trace.get_current_span().set_attribute("user.id", user_id)

    async with db_context() as db:
        message = await db.get(Message, message_id)
        if message is None:
            logger.warning(f"message {message_id} no longer exists")
            return

        recipient = await db.get(Participant, user_id)
        assert recipient is not None, "recipient must exist"

        await send_message(recipient, message)

    logger.info(f"sent test of message {message_id} to user {user_id}")
