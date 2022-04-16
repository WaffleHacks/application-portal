import asyncio
import logging
from typing import TYPE_CHECKING

import boto3
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from common import SETTINGS
from common.database import Participant, db_context

from .listener import Listener
from .models import Action, ActionType

if TYPE_CHECKING:
    from mypy_boto3_sqs.client import SQSClient


async def upsert(action: Action, db: AsyncSession):
    """
    Insert or modify a participant based on whether they exist or not
    """
    logger = logging.getLogger("upsert")

    assert action.profile is not None
    profile = action.profile.dict()

    participant = await db.get(Participant, action.id)

    # Create or update the participant
    if participant is None:
        logger.info(f"creating participant {action.id}")
        participant = Participant(**profile)
    else:
        logger.info(f"updating participant {action.id}")
        for key, value in profile.items():
            setattr(participant, key, value)

    db.add(participant)
    await db.commit()


async def remove(action: Action, db: AsyncSession):
    """
    Remove a participant from the database
    """
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

    if SETTINGS.queue is None:
        logger.error("a queue must be specified")
        return

    # TODO: perform an initial sync

    # Process messages forever
    listener = Listener(SETTINGS.queue, client)
    logger.info("listening for updates")
    for message in listener:
        try:
            action = Action.load(message.body)
        except ValidationError:
            logger.error("invalid action format", exc_info=True)
            client.delete_message(
                QueueUrl=SETTINGS.queue, ReceiptHandle=message.receipt_handle
            )
            continue

        logger.info(f"new {action.type} action on {action.id}")

        async with db_context() as db:
            if action.type == ActionType.Remove:
                await remove(action, db)
            else:
                await upsert(action, db)

        client.delete_message(
            QueueUrl=SETTINGS.queue, ReceiptHandle=message.receipt_handle
        )
        logger.info(f"processing completed for {action.type} on {action.id}")


def main():
    logging.basicConfig(level="INFO")

    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
