from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, SQLModel


class EventAttendance(SQLModel, table=True):
    __tablename__ = "event_attendance"

    participant_id: int = Field(
        sa_column=Column(
            Integer(),
            ForeignKey("participants.id", ondelete="CASCADE"),
            primary_key=True,
        )
    )
    event_id: int = Field(
        sa_column=Column(
            Integer(),
            ForeignKey("events.id", ondelete="CASCADE"),
            primary_key=True,
        )
    )
