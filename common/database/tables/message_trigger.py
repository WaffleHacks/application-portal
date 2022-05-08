from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .message import Message, MessageList


class MessageTriggerType(Enum):
    SIGN_UP = "Sign Up"
    APPLICATION_SUBMITTED = "Application - Submitted"
    APPLICATION_ACCEPTED = "Application - Accepted"
    APPLICATION_REJECTED = "Application - Rejected"
    INCOMPLETE_APPLICATION_24H = "Incomplete Application - 24hr"
    INCOMPLETE_APPLICATION_7D = "Incomplete Application - 7 day"


class MessageTriggerBase(SQLModel):
    trigger: MessageTriggerType = Field(
        sa_column=Column(
            SQLEnum(MessageTriggerType),
            nullable=False,
            primary_key=True,
        )
    )


class MessageTrigger(MessageTriggerBase, table=True):
    __tablename__ = "message_triggers"

    message_id: Optional[int] = Field(
        sa_column=Column(
            Integer(),
            ForeignKey("messages.id", ondelete="CASCADE"),
            nullable=True,
        )
    )

    message: Optional["Message"] = Relationship()


class MessageTriggerRead(MessageTriggerBase):
    message: Optional["MessageList"]


class MessageTriggerUpdate(SQLModel):
    message_id: Optional[int]
