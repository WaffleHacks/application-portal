import re
from enum import Enum
from typing import Type

from pydantic import BaseModel


class WithParticipantId(BaseModel):
    participant_id: int


class BaseAction(Enum):
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
    def for_service(service: str) -> Type["BaseAction"]:
        for subclass in BaseAction.__subclasses__():
            if subclass.__name__.lower() == service:
                return subclass

        raise ValueError(f"no such service {service!r}")

    @property
    def model(self) -> Type[BaseModel]:
        """
        The model to use to validate the message input for the action. Defaults to only the participant ID.
        """
        return WithParticipantId
