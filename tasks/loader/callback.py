import json
import traceback
from typing import Awaitable, Callable, List

from opentelemetry import trace
from opentelemetry.trace import SpanKind
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

from common.nats import Msg

from .types import Event, Handler

tracer = trace.get_tracer(__name__)
propagator = TraceContextTextMapPropagator()


def generate(
    event: Event,
    handlers: List[Handler],
) -> Callable[[Msg], Awaitable[None]]:
    """
    Build the "super callback" for the subscription that dispatches to the handlers registered to the event. All
    event handlers are run in sequence, but order is not guaranteed.
    :param event: the name of the event
    :param handlers: the handlers to be executed
    """

    async def callback(message: Msg):
        with tracer.start_as_current_span(
            event.subject,
            context=propagator.extract(message.headers or {}),
            kind=SpanKind.CONSUMER,
            attributes={
                "task.stream": event.stream,
                "task.event": event.subject,
                "task.args": message.data,
                "task.handlers.total": len(handlers),
            },
        ) as span:
            with tracer.start_as_current_span("parse"):
                kwargs = json.loads(message.data)

            failed = 0
            for handler in handlers:
                try:
                    with tracer.start_as_current_span(handler.name):
                        await handler.callback(**kwargs)
                except Exception as e:
                    failed += 1
                    traceback.print_exception(e)  # type: ignore

            span.set_attribute("task.handlers.failed", failed)

            await message.ack()

    return callback
