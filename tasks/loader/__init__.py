import logging
from asyncio import AbstractEventLoop
from pathlib import Path
from typing import Iterable, List

from common import nats
from common.nats import Subscription

from . import callback
from .resolver import resolve
from .types import Event, Handler

logger = logging.getLogger(__name__)


def register_handlers(loop: AbstractEventLoop, base: Path) -> List[Subscription]:
    """
    Register all the task handlers
    :param loop: the event loop to run handlers in
    :param base: the base path to load service handlers from
    :returns: a list of subscriptions for events
    """
    event_handlers = resolve(base)

    loop.run_until_complete(create_streams(event_handlers.keys()))
    logger.info("created streams (if not existed)")

    subscriptions = []
    for event, handlers in event_handlers.items():
        cb = callback.generate(event, handlers)
        subscription = loop.run_until_complete(nats.subscribe(event.subject, cb))

        subscriptions.append(subscription)

        logger.info(f"subscribed {len(handlers)} handlers to {event}")

    return subscriptions


async def create_streams(events: Iterable[Event]):
    """
    Create all the necessary streams with the names of the services
    """

    # Use a cache to prevent unnecessary calls to create_stream
    created = set()

    for event in events:
        if event.stream not in created:
            await nats.create_stream(
                event.stream,
                description=f"for the {event.stream} service",
            )
            created.add(event.stream)
