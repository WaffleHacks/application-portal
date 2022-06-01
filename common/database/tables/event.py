from datetime import datetime
from typing import Dict, Optional

from pydantic import root_validator
from sqlalchemy import Column
from sqlmodel import Field, SQLModel

from .types import TimeStamp


class EventBase(SQLModel):
    name: str

    code: str

    valid_from: datetime = Field(
        sa_column=Column(
            TimeStamp(timezone=True),
            default=datetime.now,
            nullable=False,
        )
    )
    valid_until: datetime = Field(
        sa_column=Column(
            TimeStamp(timezone=True),
            default=datetime.now,
            nullable=False,
        )
    )

    enabled: bool = Field(default=True, nullable=False)

    @root_validator()
    def range_is_positive(cls, values: Dict[str, datetime]):
        start, end = values["valid_from"], values["valid_until"]
        if end < start:
            raise ValueError("validity range cannot be negative")

        return values


class Event(EventBase, table=True):
    __tablename__ = "events"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)


class EventCreate(SQLModel):
    name: str

    valid_from: datetime
    valid_until: datetime


class EventList(SQLModel):
    id: int
    name: str

    code: str
    enabled: bool


class EventRead(EventBase):
    id: int


class EventUpdate(SQLModel):
    name: Optional[str]

    valid_from: Optional[datetime]
    valid_until: Optional[datetime]

    enabled: Optional[bool]
