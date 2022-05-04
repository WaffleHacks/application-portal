from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, func
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

    recipients: List["Recipient"] = Relationship(back_populates="message")

    created_at: datetime = Field(
        sa_column=Column(TimeStamp(), nullable=False, server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(TimeStamp(), nullable=False, server_default=func.now())
    )


class MessageCreate(SQLModel):
    subject: str
    content: str

    recipients: List["Group"]


class MessageRead(MessageBase):
    id: int

    recipients: List["RecipientRead"]

    created_at: datetime
    updated_at: datetime


# TODO: figure out most ergonomic way to handle updating recipients
class MessageUpdate(SQLModel):
    sent: Optional[bool]

    subject: Optional[str]
    content: Optional[str]
