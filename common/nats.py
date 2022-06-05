from typing import Awaitable, Callable, Optional

from nats import NATS
from nats.aio.msg import Msg
from nats.aio.subscription import Subscription
from nats.js.api import RetentionPolicy, StorageType
from nats.js.errors import NotFoundError

from common import SETTINGS

__client = NATS()


async def __connect():
    """
    Handle automatically connecting to NATS when needed
    """
    if not __client.is_connected and not __client.is_reconnecting:
        await __client.connect(servers=SETTINGS.nats_url)


async def create_stream(name: str, description: Optional[str] = None):
    """
    Create a new stream if it doesn't already exist
    :param name: the name for the stream
    :param description: a description for the stream
    """
    await __connect()
    jetstream = __client.jetstream()

    try:
        await jetstream.stream_info(name)
    except NotFoundError:
        await jetstream.add_stream(
            name=name,
            subjects=[f"{name}.automated.*", f"{name}.manual.*"],
            description=description,
            storage=StorageType.FILE,
            retention=RetentionPolicy.WORK_QUEUE,
            num_replicas=1,
            max_age=60 * 60 * 24 * 180,  # 6 months
        )


async def subscribe(
    subject: str, callback: Callable[[Msg], Awaitable[None]]
) -> Subscription:
    """
    Subscribe to a subject
    """
    await __connect()
    jetstream = __client.jetstream()

    return await jetstream.subscribe(
        subject=subject,
        queue=subject.replace(".", "-"),
        cb=callback,
    )
