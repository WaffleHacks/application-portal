from dataclasses import dataclass
from enum import Enum
from typing import Type

from pydantic import BaseModel

from ..base import Event
from ..errors import LoaderException

# Register the actions with the base class
from .authentication import Authentication as _AuthenticationAction
from .base_action import BaseAction
from .registration import Registration as _RegistrationAction
from .unused_actions import Communication as _CommunicationAction
from .unused_actions import Integrations as _IntegrationsAction
from .workshops import Workshops as _WorkshopsAction


class Service(Enum):
    Authentication = "authentication"
    Communication = "communication"
    Integrations = "integrations"
    Registration = "registration"
    Workshops = "workshops"


@dataclass
class AutomatedEvent(Event):
    KIND = "automated"

    service: Service
    action: BaseAction

    @property
    def name(self) -> str:
        return f"{self.service.value}.{self.action.value}"

    @property
    def input_validator(self) -> Type[BaseModel]:
        return self.action.model

    @property
    def stream(self) -> str:
        return self.service.value

    @property
    def subject(self) -> str:
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
            action_enum = BaseAction.for_service(service.value)
            action = action_enum(raw_action)
        except ValueError:
            raise UnknownAction(f"unknown action {raw_action!r} in {raw!r}")

        return cls(service=service, action=action)

    def __hash__(self):
        return self.service.__hash__() ^ self.action.__hash__()


class InvalidEvent(LoaderException):
    """
    An error occurred while parsing the event
    """

    pass


class UnknownService(InvalidEvent):
    """
    The specified service does not exist
    """

    pass


class UnknownAction(InvalidEvent):
    """
    The specified action does not exist on the service
    """

    pass
