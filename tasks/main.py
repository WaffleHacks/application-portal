import asyncio
import logging
import signal
import sys
from pathlib import Path

from common import SETTINGS, tracing

from . import loader

HANDLERS_PATH = Path(__file__).parent / "handlers"

tracing.init()


def main():
    logging.basicConfig(
        level=SETTINGS.tasks.log_level.value,
        format="[%(asctime)s] %(levelname)s - %(name)s - %(message)s",
        stream=sys.stdout,
    )
    logger = logging.getLogger("tasks")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    logger.info("starting task workers")

    subscriptions = loader.register_handlers(loop, HANDLERS_PATH)

    def on_shutdown():
        logger.info("received shutdown signal")
        loop.stop()

        # Stop all the consumers
        for subscription in subscriptions:
            logger.debug(f"unsubscribing from queue {subscription.queue}...")
            asyncio.ensure_future(subscription.unsubscribe(), loop=loop)

        logger.info(f"unsubscribed {len(subscriptions)} event consumers")

    # Register signal handlers
    try:
        loop.add_signal_handler(signal.SIGINT, on_shutdown)
        loop.add_signal_handler(signal.SIGTERM, on_shutdown)
    except NotImplementedError:
        pass

    # Start the handlers
    try:
        loop.run_forever()
    finally:
        logger.info("shutdown successfully, bye :)")


if __name__ == "__main__":
    main()
