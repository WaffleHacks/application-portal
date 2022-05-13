from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from .types import TimeStamp

if TYPE_CHECKING:
    from .recipient import Group, Recipient, RecipientRead


class MessageBase(SQLModel):
    sent: bool = Field(default=False, nullable=False)

    subject: str
    content: str


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
    sent: bool

    created_at: datetime
    updated_at: datetime


class MessageRead(MessageBase):
    id: int

    recipients: List["RecipientRead"]

    created_at: datetime
    updated_at: datetime


# TODO: figure out most ergonomic way to handle updating recipients
class MessageUpdate(SQLModel):
    sent: Optional[bool]

    recipients: Optional[List["Group"]]

    subject: Optional[str]
    content: Optional[str]
