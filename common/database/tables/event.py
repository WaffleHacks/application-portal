from datetime import datetime
from typing import TYPE_CHECKING, Dict, List, Optional

from pydantic import root_validator
from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from .event_attendance import EventAttendance
from .types import TimeStamp

if TYPE_CHECKING:
    from .feedback import Feedback, FeedbackList
    from .participant import Participant, ParticipantList


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

    attendees: List["Participant"] = Relationship(
        back_populates="attended",
        link_model=EventAttendance,
    )
    feedback: List["Feedback"] = Relationship(back_populates="event")


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

    feedback: List["FeedbackList"]
    attendees: List["ParticipantList"]


class EventUpdate(SQLModel):
    name: Optional[str]

    valid_from: Optional[datetime]
    valid_until: Optional[datetime]

    enabled: Optional[bool]
