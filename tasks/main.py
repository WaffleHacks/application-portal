import asyncio
import logging
import signal
import sys
from asyncio import StreamReader, StreamWriter
from pathlib import Path

from common import database, nats, tracing, version

from . import loader
from .settings import SETTINGS

HANDLERS_PATH = Path(__file__).parent / "handlers"

tracing.init()


def main():
    logging.basicConfig(
        level=SETTINGS.log_level.value,
        format=f"[%(asctime)s] %(levelname)s ({version.commit}) - %(name)s - %(message)s",
        stream=sys.stdout,
    )
    logger = logging.getLogger("tasks")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    logger.info("starting task workers")

    subscriptions = loader.register_handlers(loop, HANDLERS_PATH)

    loop.run_until_complete(database.warm_up())

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

    loop.create_task(
        asyncio.start_server(
            healthcheck,
            host=SETTINGS.healthcheck_host,
            port=SETTINGS.healthcheck_port,
        )
    )
    logger.info(
        f"healthcheck server running on {SETTINGS.healthcheck_host}:{SETTINGS.healthcheck_port}"
    )

    # Start the handlers
    try:
        loop.run_forever()
    finally:
        logger.info("shutdown successfully, bye :)")


async def healthcheck(reader: StreamReader, writer: StreamWriter):
    # Wait for the request to come in
    await reader.readuntil(b"\r\n")

    await database.healthcheck()
    await nats.healthcheck()

    body = f"version: {version.commit}".encode()
    content_length = f"Content-Length: {len(body)}\r\n".encode()

    writer.write(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n")
    writer.write(content_length)
    writer.write(b"\r\n")
    writer.write(body)
    writer.close()


if __name__ == "__main__":
    main()
