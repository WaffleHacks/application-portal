from functools import wraps
from typing import Any, Callable

from asgiref.sync import async_to_sync
from celery import Celery, signature

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


def task(module: str, name: str, **options):
    """
    Call a celery task by name. Supports passing options to `apply_async` via keyword-arguments.
    """
    s = signature(f"{module}.tasks.{name}")

    def inner(*args, **kwargs):
        s.apply_async(args, kwargs, **options)

    return inner


def syncify(func: Callable[..., Any]):
    """
    Convert a coroutine function to a synchronous function
    :param func: the coroutine function
    :return: a synchronous function
    """

    @wraps(func)
    def wrapped(*args, **kwargs):
        return async_to_sync(func)(*args, **kwargs)

    return wrapped
