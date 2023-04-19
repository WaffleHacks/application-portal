from typing import TYPE_CHECKING

from pydantic import validator
from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .event import Event, EventList
    from .participant import Participant, ParticipantList


class FeedbackBase(SQLModel):
    presentation: int
    content: int
    interest: int

    comments: str = Field(default="", nullable=False)
    again: bool = Field(default=True, nullable=False)

    @validator("presentation", "content", "interest")
    def between_1_and_5(cls, value: int):
        if value < 1 or value > 5:
            raise ValueError("must be between 1 and 5 inclusive")
        return value


class Feedback(FeedbackBase, table=True):
    __tablename__ = "feedback"

    participant_id: int = Field(
        sa_column=Column(
            Integer(),
            ForeignKey("participants.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        )
    )
    participant: "Participant" = Relationship()

    event_id: int = Field(
        sa_column=Column(
            Integer(),
            ForeignKey("events.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        )
    )
    event: "Event" = Relationship(back_populates="feedback")


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackList(SQLModel):
    participant: "ParticipantList"

    presentation: int
    content: int
    interest: int


class FeedbackRead(FeedbackBase):
    participant: "ParticipantList"
    event: "EventList"
