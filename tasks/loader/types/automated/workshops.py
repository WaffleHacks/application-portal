from enum import auto
from typing import Type

from pydantic import BaseModel

from .base_action import BaseAction


class WithEventId(BaseModel):
    event_id: int


class Workshops(BaseAction):
    Updated = auto()
    Deleted = auto()

    @property
    def model(self) -> Type[BaseModel]:
        return WithEventId
