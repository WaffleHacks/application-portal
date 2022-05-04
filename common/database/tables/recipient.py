from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .message import Message


class Group(Enum):
    EVERYONE = "Everyone"
    APPLICATION_COMPLETE = "Application - Complete"
    APPLICATION_INCOMPLETE = "Application - Incomplete"
    STATUS_ACCEPTED = "Status - Accepted"
    STATUS_DENIED = "Status - Denied"
    STATUS_PENDING = "Status - Pending"


class Recipient(SQLModel, table=True):
    __tablename__ = "recipients"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)

    message_id: int = Field(
        sa_column=Column(Integer(), ForeignKey("messages.id", ondelete="CASCADE"))
    )
    message: "Message" = Relationship(back_populates="recipients")

    group: Group = Field(sa_column=Column(SQLEnum(Group), nullable=False))


class RecipientRead(SQLModel):
    id: int
    group: Group
