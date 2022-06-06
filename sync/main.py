import asyncio
import logging
from typing import TYPE_CHECKING

import boto3
from opentelemetry import trace
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from common import SETTINGS, tracing
from common.database import Participant, db_context
from common.tasks import broadcast

from .listener import Listener
from .models import Action, ActionType

if TYPE_CHECKING:
    from mypy_boto3_sqs.client import SQSClient


tracing.init()
tracer = trace.get_tracer(__name__)


async def upsert(action: Action, db: AsyncSession):
    """
    Insert or modify a participant based on whether they exist or not
    """
    with tracer.start_as_current_span("upsert"):
        logger = logging.getLogger("upsert")

        assert action.profile is not None
        profile = action.profile.dict()

        participant = await db.get(Participant, action.id)

        # Create or update the participant
        with tracer.start_as_current_span("modify") as span:
            if participant is None:
                span.set_attribute("action", "create")
                logger.info(f"creating participant {action.id}")
                participant = Participant(**profile)

                await broadcast("sync", "sign_up", participant_id=action.id)
            else:
                span.set_attribute("action", "update")
                logger.info(f"updating participant {action.id}")
                for key, value in profile.items():
                    setattr(participant, key, value)

        db.add(participant)
        await db.commit()


async def remove(action: Action, db: AsyncSession):
    """
    Remove a participant from the database
    """
    with tracer.start_as_current_span("remove"):
        logger = logging.getLogger("remove")

        participant = await db.get(Participant, action.id)
        if participant is not None:
            await db.delete(participant)
            await db.commit()

            logger.info(f"removed participant {action.id}")
        else:
            logger.info(f"participant {action.id} already removed")


async def run():
    client: "SQSClient" = boto3.client("sqs")  # type: ignore
    logger = logging.getLogger("sync")
    queue = SETTINGS.sync.queue

    # TODO: perform an initial sync

    # Process messages forever
    listener = Listener(queue, client)
    logger.info("listening for updates")
    for message in listener:
        with tracer.start_as_current_span("message"):
            with tracer.start_as_current_span("parse"):
                try:
                    action = Action.load(message.body)
                except ValidationError:
                    logger.error("invalid action format", exc_info=True)
                    client.delete_message(
                        QueueUrl=queue,
                        ReceiptHandle=message.receipt_handle,
                    )
                    continue

            logger.info(f"new {action.type} action on {action.id}")

            with tracer.start_as_current_span("process") as span:
                span.set_attribute("user.id", action.id)

                async with db_context() as db:
                    if action.type == ActionType.Remove:
                        await remove(action, db)
                    else:
                        await upsert(action, db)

            client.delete_message(QueueUrl=queue, ReceiptHandle=message.receipt_handle)
            logger.info(f"processing completed for {action.type} on {action.id}")


def main():
    logging.basicConfig(level="INFO")

    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
