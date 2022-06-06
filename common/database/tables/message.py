from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from pydantic import validator
from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, Relationship, SQLModel

from .types import TimeStamp

if TYPE_CHECKING:
    from .recipient import Group, Recipient, RecipientRead


class Status(Enum):
    DRAFT = "Draft"
    READY = "Ready to Send"
    SENDING = "Sending..."
    SENT = "Sent"


class MessageBase(SQLModel):
    status: Status = Field(
        default=Status.DRAFT,
        sa_column=Column(
            SQLEnum(Status, name="message_status"),
            nullable=False,
            server_default=Status.DRAFT.name,
        ),
    )

    subject: str
    content: str

    # Internal attributes
    rendered: str
    is_html: bool = Field(default=False, nullable=False)


class Message(MessageBase, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)

    recipients: List["Recipient"] = Relationship(
        back_populates="message",
        sa_relationship_kwargs={"cascade": "all, delete, delete-orphan"},
    )

    created_at: Optional[datetime] = Field(
        sa_column=Column(
            TimeStamp(timezone=True),
            nullable=False,
            default=datetime.now,
        )
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(
            TimeStamp(timezone=True),
            nullable=False,
            default=datetime.now,
            onupdate=datetime.now,
        )
    )


class MessageCreate(SQLModel):
    subject: str
    content: str

    recipients: List["Group"]


class MessageList(SQLModel):
    id: int
    subject: str
    status: Status

    created_at: datetime
    updated_at: datetime


class MessageRead(MessageBase):
    id: int

    recipients: List["RecipientRead"]

    created_at: datetime
    updated_at: datetime


class MessageUpdate(SQLModel):
    status: Optional[Status]

    recipients: Optional[List["Group"]]

    subject: Optional[str]
    content: Optional[str]

    @validator("status")
    def no_sending_states(cls, value: Status) -> Status:
        if value not in {Status.DRAFT, Status.READY}:
            raise ValueError("invalid status for manual modification")

        return value
