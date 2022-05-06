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


class RecipientBase(SQLModel):
    group: Group = Field(
        sa_column=Column(
            SQLEnum(Group),
            nullable=False,
            primary_key=True,
        )
    )


class Recipient(RecipientBase, table=True):
    __tablename__ = "recipients"

    message_id: int = Field(
        sa_column=Column(
            Integer(),
            ForeignKey("messages.id", ondelete="CASCADE"),
            primary_key=True,
        )
    )
    message: "Message" = Relationship(back_populates="recipients")


class RecipientCreate(RecipientBase):
    pass


class RecipientRead(RecipientBase):
    pass
