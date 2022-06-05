import logging
import traceback
from typing import Awaitable, Callable, List

from opentelemetry import trace
from opentelemetry.trace import SpanKind
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from pydantic import ValidationError

from common.nats import Msg

from .types import Event, Handler

logger = logging.getLogger(__name__)

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
            event.name,
            context=propagator.extract(message.headers or {}),
            kind=SpanKind.CONSUMER,
            attributes={
                "task.name": event.name,
                "task.kind": event.KIND,
                "task.stream": event.stream,
                "task.subject": event.subject,
                "task.args": message.data,
                "task.handlers.total": len(handlers),
            },
        ) as span:

            # Parse and validate the input
            try:
                with tracer.start_as_current_span("parse"):
                    kwargs = event.input_validator.parse_raw(
                        message.data.decode("utf-8")
                    )
            except ValidationError:
                ctx = span.get_span_context()
                logger.error(
                    f"invalid input for {event.name} ({event.KIND}) - trace id: {ctx.trace_id}"
                )

                # Acknowledge the message on failure since retrying it won't yield any benefits
                await message.ack()
                return

            failed = 0
            for handler in handlers:
                try:
                    with tracer.start_as_current_span(handler.name):
                        await handler.callback(**kwargs.dict())
                except Exception as e:
                    failed += 1
                    traceback.print_exception(e)  # type: ignore

            span.set_attribute("task.handlers.failed", failed)

            await message.ack()

    return callback
