from enum import IntEnum, auto
from typing import Optional, Union

from pydantic import BaseModel


class Status(IntEnum):
    SUCCESS = auto()
    TRANSIENT_FAILURE = auto()
    FAILURE = auto()


class Response(BaseModel):
    status: Status = Status.SUCCESS

    # Delay the processing of the message by a given amount of seconds
    delay: Optional[Union[int, float]] = None

    # A reason the handler failed
    reason: Optional[str] = None

    @classmethod
    def success(cls) -> "Response":
        return cls(status=Status.SUCCESS)

    @classmethod
    def delay_for(cls, duration: Union[int, float]):
        return cls(status=Status.SUCCESS, delay=duration)

    @classmethod
    def transient_failure(
        cls,
        reason: str,
        retry_after: Optional[Union[int, float]] = None,
    ) -> "Response":
        return cls(status=Status.TRANSIENT_FAILURE, reason=reason, delay=retry_after)

    @classmethod
    def failure(cls, reason: str) -> "Response":
        return cls(status=Status.FAILURE, reason=reason)
