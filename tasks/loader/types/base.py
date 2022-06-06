from abc import ABC, abstractmethod
from typing import Type

from pydantic import BaseModel


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
    def input_validator(self) -> Type["BaseModel"]:
        """
        A model to check that the incoming message has the proper format
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
