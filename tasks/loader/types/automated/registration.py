from enum import auto

from .base_action import BaseAction


class Registration(BaseAction):
    NewApplication = auto()
    Accepted = auto()
    Rejected = auto()
