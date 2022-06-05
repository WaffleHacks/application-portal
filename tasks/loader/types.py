import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum, auto
from typing import Awaitable, Callable, Type, Union

from .errors import UnknownAction, UnknownService


class Service(Enum):
    Communication = "communication"
    Integrations = "integrations"
    Registration = "registration"
    Sync = "sync"
    Workshops = "workshops"


class BaseEnum(Enum):
    @staticmethod
    def _generate_next_value_(
        name: str, start: int, count: int, last_values: list[str]
    ) -> str:
        """
        Generate the name for the action based off the constant name as snake case.
        Title/camel case to snake case conversion from https://stackoverflow.com/a/37697078.
        """
        partial = re.sub("([A-Z]+)", r" \1", name)
        full = re.sub("([A-Z][a-z]+)", r" \1", partial)
        lowercase_parts = full.lower().split()
        return "_".join(lowercase_parts)

    @staticmethod
    def for_service(service: str) -> Type["BaseEnum"]:
        for subclass in BaseEnum.__subclasses__():
            if subclass.__name__.lower().startswith(service):
                return subclass

        raise ValueError(f"no such service {service!r}")


class CommunicationAction(BaseEnum):
    pass


class IntegrationsAction(BaseEnum):
    pass


class RegistrationAction(BaseEnum):
    NewApplication = auto()
    Accepted = auto()
    Rejected = auto()


class SyncAction(BaseEnum):
    SignUp = auto()


class WorkshopsAction(BaseEnum):
    pass


class Event(ABC):
    KIND: str

    @classmethod
    @abstractmethod
    def parse(cls, raw: str) -> "Event":
        """
        Parse the event from a string
        """

    @property
    @abstractmethod
    def name(self) -> str:
        """
        The name of the event
        """

    @property
    @abstractmethod
    def stream(self) -> str:
        """
        The stream to receive messages on
        """

    @property
    @abstractmethod
    def subject(self) -> str:
        """
        The subject to route messages through
        """

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


@dataclass
class ManualEvent(Event):
    KIND = "manual"

    belongs_to: str
    method: str

    @property
    def name(self) -> str:
        return f"{self.belongs_to}.{self.method}"

    @property
    def stream(self) -> str:
        return self.belongs_to

    @property
    def subject(self) -> str:
        return f"{self.belongs_to}.{self.KIND}.{self.method}"

    @classmethod
    def parse(cls, raw: str) -> "Event":
        raise NotImplementedError("This should be constructed manually by the caller")

    def __hash__(self):
        return self.belongs_to.__hash__() ^ self.method.__hash__()


@dataclass
class AutomatedEvent(Event):
    KIND = "automated"

    service: Service
    action: BaseEnum

    @property
    def name(self):
        return f"{self.service.value}.{self.service.value}"

    @property
    def stream(self):
        return self.service.value

    @property
    def subject(self):
        return f"{self.service.value}.{self.KIND}.{self.action.value}"

    @classmethod
    def parse(cls, raw: str) -> "Event":
        [raw_service, raw_action] = raw.split(".", 1)

        # Get the service
        try:
            service = Service(raw_service)
        except ValueError:
            raise UnknownService(f"unknown service {raw_service!r} in {raw!r}")

        # Get the action
        try:
            action_enum = BaseEnum.for_service(service.value)
            action = action_enum(raw_action)
        except ValueError:
            raise UnknownAction(f"unknown action {raw_action!r} in {raw!r}")

        return cls(service=service, action=action)

    def __hash__(self):
        return self.service.__hash__() ^ self.action.__hash__()


@dataclass
class Handler:
    name: str
    callback: Callable[..., Awaitable[None]]
