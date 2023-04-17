from dataclasses import dataclass
from typing import Awaitable, Callable, Union

from tasks.handlers.models import Response

from .automated import AutomatedEvent
from .base import Event
from .errors import LoaderException
from .manual import ManualEvent


@dataclass
class Handler:
    name: str
    callback: Callable[..., Awaitable[Union[Response, None]]]
