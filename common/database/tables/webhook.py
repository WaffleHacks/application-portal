from enum import Enum
from typing import Any, Optional

from pydantic import HttpUrl, validator
from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, SQLModel


class Format(Enum):
    JSON = "JSON"
    DISCORD = "Discord"


class Trigger(int):
    SIGN_UP = 1
    APPLICATION_SUBMITTED = 2
    APPLICATION_ACCEPTED = 4
    APPLICATION_REJECTED = 8
    WORKSHOP_UPDATED = 16
    WORKSHOP_DELETED = 32

    @staticmethod
    def all() -> "Trigger":
        return Trigger(
            Trigger.SIGN_UP
            | Trigger.APPLICATION_SUBMITTED
            | Trigger.APPLICATION_ACCEPTED
            | Trigger.APPLICATION_REJECTED
            | Trigger.WORKSHOP_UPDATED
            | Trigger.WORKSHOP_DELETED
        )

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value: Any):
        if not isinstance(value, int):
            raise TypeError("integer required")
        elif value > cls.all():
            raise ValueError("cannot be larger than all flags")

        return cls(value)


class WebhookBase(SQLModel):
    enabled: bool = True

    url: HttpUrl

    format: Format = Field(
        sa_column=Column(SQLEnum(Format, name="webhook_format"), nullable=False)
    )
    triggered_by: Trigger


class WebhookBaseWithSensitive(WebhookBase):
    secret: Optional[str]


class Webhook(WebhookBaseWithSensitive, table=True):
    __tablename__ = "webhooks"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)


class WebhookCreate(WebhookBaseWithSensitive):
    @validator("secret")
    def empty_string_as_null(cls, value):
        if isinstance(value, str) and len(value) == 0:
            return None

        return value


class WebhookRead(WebhookBase):
    id: int


class WebhookList(SQLModel):
    id: int
    enabled: bool
    url: HttpUrl


class WebhookUpdate(SQLModel):
    enabled: Optional[bool]
    url: Optional[HttpUrl]
    secret: Optional[str]
    format: Optional[Format]
    triggered_by: Optional[Trigger]

    @validator("secret")
    def empty_string_as_null(cls, value):
        if isinstance(value, str) and len(value) == 0:
            return None

        return value
