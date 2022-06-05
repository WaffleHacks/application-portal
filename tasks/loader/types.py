import re
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


@dataclass
class Event:
    service: Service
    action: Union[
        CommunicationAction,
        IntegrationsAction,
        RegistrationAction,
        SyncAction,
        WorkshopsAction,
    ]

    @property
    def stream(self):
        return self.service.value

    @property
    def subject(self):
        return f"{self.service.value}.{self.action.value}"

    def __str__(self):
        return self.subject

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

        return cls(service, action)  # type: ignore

    def __hash__(self):
        return self.service.__hash__() ^ self.action.__hash__()


@dataclass
class Handler:
    name: str
    callback: Callable[..., Awaitable[None]]
