import logging
import traceback
from typing import Any, Awaitable, Callable, Dict, List, Optional

from opentelemetry import trace
from opentelemetry.trace import Context, Link, SpanKind
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from pydantic import ValidationError

from common.nats import Msg

from ..handlers.models import Response, Status
from .types import Event, Handler, ManualEvent

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
    if isinstance(event, ManualEvent):
        executor = single_executor
    else:
        executor = batch_executor

    async def callback(message: Msg):
        with tracer.start_as_current_span(
            event.name,
            links=get_linked_trace(message.headers),
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

            # Execute the callback(s)
            await executor(message, handlers, kwargs.dict())

    return callback


async def batch_executor(message: Msg, handlers: List[Handler], args: Dict[str, Any]):
    """
    Execute a batch of handlers in sequence
    :param message: the message to acknowledge
    :param handlers: the handlers to execute
    :param args: keyword arguments to pass to the handler
    """
    span = trace.get_current_span()

    failed = 0
    for handler in handlers:
        try:
            with tracer.start_as_current_span(handler.name):
                await handler.callback(**args)
        except Exception as e:
            failed += 1
            traceback.print_exception(e)  # type: ignore

    span.set_attribute("task.handlers.failed", failed)

    await message.ack()


async def single_executor(message: Msg, handlers: List[Handler], args: Dict[str, Any]):
    """
    Execute a single handler and act according to its response
    :param message: the message to use for responses
    :param handlers: the handler to execute, must be a list with a single element
    :param args: keyword arguments to pass to the handler
    """
    parent = trace.get_current_span()

    failed = False
    try:
        with tracer.start_as_current_span(handlers[0].name) as span:
            result = await handlers[0].callback(**args)

            # Process the response
            if isinstance(result, Response):
                # Handle successful or delayed responses
                if result.status == Status.SUCCESS:
                    if result.delay:
                        span.set_attribute("task.delayed", True)
                        span.set_attribute("task.delayed.for", result.delay)
                        await message.nak(delay=result.delay)
                    else:
                        await message.ack()

                # Handle the different failure modes
                else:
                    failed = True

                    if result.status == Status.TRANSIENT_FAILURE:
                        if result.delay:
                            span.set_attribute("task.delayed", True)
                            span.set_attribute("task.delayed.for", result.delay)

                        await message.nak(delay=result.delay)
                    else:
                        await message.term()

                    span.set_attribute("error", True)
                    if result.reason:
                        span.set_attribute("error_description", result.reason)

            # If anything else is returned, simply acknowledge the message
            else:
                await message.ack()

    except Exception as e:
        failed = True

        traceback.print_exception(e)  # type: ignore
        await message.ack()

    parent.set_attribute("task.handlers.failed", int(failed))


def get_linked_trace(headers: Optional[Dict[str, str]]) -> List[Link]:
    """
    Get the linked trace from the message headers
    """
    ctx = Context()
    ctx = propagator.extract(headers or {}, context=ctx)

    span = trace.get_current_span(ctx)
    if span == trace.INVALID_SPAN:
        return []

    return [Link(span.get_span_context())]
