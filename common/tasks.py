import asyncio
import logging
from functools import wraps
from logging import Logger
from typing import Any, Awaitable, Callable

from celery import Celery, signature
from celery.result import AsyncResult
from celery.signals import after_setup_task_logger

from common import SETTINGS

# Configure celery
celery = Celery(broker=SETTINGS.redis_url, backend=SETTINGS.redis_url)
celery.config_from_object(
    {
        "enable_utc": True,
        "accept_content": ["json"],
        "task_serializer": "json",
        "result_accept_content": ["json"],
        "result_persistent": False,
        "result_serializer": "json",
        "worker_send_task_events": True,
    }
)

celery.autodiscover_tasks(
    packages=["communication", "integrations", "registration", "sync", "workshops"]
)


@after_setup_task_logger.connect
def on_after_setup_task_logger(logger: Logger, **_):
    logger.setLevel(logging.INFO)


def task(module: str, name: str, **options) -> Callable[..., AsyncResult]:
    """
    Call a celery task by name. Supports passing options to `apply_async` via keyword-arguments.
    """
    s = signature(f"{module}.tasks.{name}")

    def inner(*args, **kwargs) -> AsyncResult:
        return s.apply_async(args, kwargs, **options)

    return inner


def syncify(func: Callable[..., Awaitable[Any]]):
    """
    Convert a coroutine function to a synchronous function
    :param func: the coroutine function
    :return: a synchronous function
    """

    @wraps(func)
    def wrapped(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(func(*args, **kwargs))

    return wrapped