from enum import Enum
from typing import TYPE_CHECKING, Optional, Set

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel

from .application import Status

if TYPE_CHECKING:
    from .message import Message


class Group(Enum):
    EVERYONE = "Everyone"
    APPLICATION_COMPLETE = "Application - Complete"
    APPLICATION_INCOMPLETE = "Application - Incomplete"
    STATUS_ACCEPTED = "Status - Accepted"
    STATUS_DENIED = "Status - Denied"
    STATUS_PENDING = "Status - Pending"

    @staticmethod
    def completion_states() -> Set["Group"]:
        return {Group.APPLICATION_COMPLETE, Group.APPLICATION_INCOMPLETE}

    @staticmethod
    def statuses() -> Set["Group"]:
        return {Group.STATUS_ACCEPTED, Group.STATUS_DENIED, Group.STATUS_PENDING}

    def to_status(self) -> Optional[Status]:
        if self == Group.STATUS_ACCEPTED:
            return Status.ACCEPTED
        elif self == Group.STATUS_DENIED:
            return Status.REJECTED
        elif self == Group.STATUS_PENDING:
            return Status.PENDING
        else:
            return None


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
