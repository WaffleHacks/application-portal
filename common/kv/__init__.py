import inspect
from types import ModuleType
from typing import Callable, Optional, cast

from ..settings import SETTINGS
from .engine import Engine, NamespacedClient

engine = Engine(SETTINGS.redis_url)


async def healthcheck():
    """
    Check that the Redis connection is working
    """
    await engine.client().ping()


def with_kv(namespace: Optional[str] = None) -> Callable[[], NamespacedClient]:
    """
    Open a Redis connection from the connection pool
    :param namespace: an optional namespace, defaults to the caller's module
    :return: a redis connection
    """

    # Set the namespace to the caller if one is not provided
    if namespace is None:
        caller = inspect.stack()[1]
        module = inspect.getmodule(caller[0], None)

        assert module is not None
        namespace = cast(ModuleType, module).__name__

    return lambda: engine.namespaced(cast(str, namespace))
