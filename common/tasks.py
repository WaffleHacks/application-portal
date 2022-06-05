from typing import List, Optional

from common.nats import publish


async def broadcast(service: str, event: str, **kwargs):
    """
    Broadcast an automated event to all the task handlers
    :param service: the service that owns the event
    :param event: the event to trigger
    :param kwargs: any parameters to pass to the handlers
    """
    await publish(f"{service}.automated.{event}", kwargs)


class TasksProxy(object):
    def __init__(self, previous: Optional[List[str]] = None):
        self.__previous = previous or []

    def __getattr__(self, item: str) -> "TasksProxy":
        if len(self.__previous) >= 2:
            raise AttributeError(f"'tasks' object has no attribute {item!r}")

        return TasksProxy(self.__previous + [item])

    async def __call__(self, **kwargs):
        assert len(self.__previous) == 2

        await publish(f"{self.__previous[0]}.manual.{self.__previous[1]}", kwargs)


# Used for "magically" calling a task
tasks = TasksProxy()
