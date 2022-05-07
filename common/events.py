import json
from typing import Callable

from nats.aio.client import Client as NATS
from nats.aio.subscription import Subscription

from .settings import SETTINGS


class Client(object):
    def __init__(self, url: str):
        self.url = url
        self.client = NATS()

    async def connect(self):
        """
        Initiate a connection if the client is not connected and not in the process of reconnecting
        """
        if not self.client.is_connected and not self.client.is_reconnecting:
            await self.client.connect(self.url)

    async def publish(self, subject: str, message: object):
        """
        Publish a message to the specified subject
        """
        serialized = json.dumps(message).encode("utf-8")
        await self.client.jetstream().publish(subject, serialized)

    async def subscribe(self, subject: str) -> Subscription:
        """
        Subscribe to the specified subject
        """
        return await self.client.jetstream().subscribe(subject)


client = Client(SETTINGS.nats_url)


async def with_events() -> Callable[[], Client]:
    """
    Get a NATS client allowing publishing and subscribing. Automatically handles connecting to the NATS server.
    """
    await client.connect()

    return lambda: client
