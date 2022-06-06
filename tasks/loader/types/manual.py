from dataclasses import dataclass
from typing import Type

from pydantic import BaseModel

from .base import Event


@dataclass(init=False)
class ManualEvent(Event):
    KIND = "manual"

    belongs_to: str
    method: str
    model: Type[BaseModel]

    def __init__(self, belongs_to: str, method: str):
        self.belongs_to = belongs_to
        self.method = method
        self.model = BaseModel

    @property
    def name(self) -> str:
        return f"{self.belongs_to}.{self.method}"

    @property
    def input_validator(self) -> Type[BaseModel]:
        return self.model

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
