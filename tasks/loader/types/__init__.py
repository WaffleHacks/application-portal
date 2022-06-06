from dataclasses import dataclass
from typing import Awaitable, Callable

from .automated import AutomatedEvent
from .base import Event
from .errors import LoaderException
from .manual import ManualEvent


@dataclass
class Handler:
    name: str
    callback: Callable[..., Awaitable[None]]
