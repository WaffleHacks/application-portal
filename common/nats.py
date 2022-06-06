import json
from typing import Any, Awaitable, Callable, Dict, Optional

from nats import NATS
from nats.aio.msg import Msg
from nats.aio.subscription import Subscription
from nats.js import JetStreamContext
from nats.js.api import RetentionPolicy, StorageType
from nats.js.errors import NotFoundError
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from pydantic.json import pydantic_encoder

from common import SETTINGS

__client = NATS()
__propagator = TraceContextTextMapPropagator()


async def __connect() -> JetStreamContext:
    """
    Handle automatically connecting to NATS when needed
    """
    if not __client.is_connected and not __client.is_reconnecting:
        await __client.connect(servers=SETTINGS.nats_url)

    return __client.jetstream()


async def create_stream(name: str, description: Optional[str] = None):
    """
    Create a new stream if it doesn't already exist
    :param name: the name for the stream
    :param description: a description for the stream
    """
    jetstream = await __connect()

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
    jetstream = await __connect()

    return await jetstream.subscribe(
        subject=subject,
        queue=subject.replace(".", "-"),
        cb=callback,
    )


async def publish(subject: str, message: Any):
    """
    Publish a JSON-encoded message
    """
    jetstream = await __connect()

    # Inject tracing information
    headers: Dict[str, str] = {}
    __propagator.inject(headers)

    encoded = json.dumps(message, default=pydantic_encoder).encode()
    await jetstream.publish(subject, encoded, headers=headers)
