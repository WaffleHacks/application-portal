from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Dict, List, Optional

import pytz
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
    link: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

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
        start, end = values.get("valid_from"), values.get("valid_until")
        if start is None or end is None:
            return values
        elif end < start:
            raise ValueError("validity range cannot be negative")

        return values


class Event(EventBase, table=True):
    __tablename__ = "events"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)

    attendees: List["Participant"] = Relationship(
        back_populates="attended",
        link_model=EventAttendance,
    )
    feedback: List["Feedback"] = Relationship(
        back_populates="event",
        sa_relationship_kwargs={"cascade": "all, delete, delete-orphan"},
    )

    @property
    def can_mark_attendance(self) -> bool:
        """
        Only mark attendance within 2.5 mins of the event on either end and it is enabled
        :return:
        """
        now = datetime.now(tz=pytz.utc)
        offset = timedelta(minutes=2, seconds=30)
        in_duration = (self.valid_from - offset) <= now <= (self.valid_until + offset)

        return in_duration and self.enabled

    @property
    def can_submit_feedback(self) -> bool:
        """
        Only allow submitting feedback if the event is enabled and has started
        """
        return self.enabled and self.valid_from <= datetime.now(tz=pytz.utc)


class EventCreate(SQLModel):
    name: str
    link: Optional[str]
    description: Optional[str]

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
    link: Optional[str]
    description: Optional[str]

    valid_from: Optional[datetime]
    valid_until: Optional[datetime]

    enabled: Optional[bool]
