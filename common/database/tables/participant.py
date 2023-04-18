from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from pydantic import EmailStr
from sqlalchemy import Column
from sqlalchemy import Enum as SqlEnum
from sqlmodel import Field, Relationship, SQLModel

from .event_attendance import EventAttendance

if TYPE_CHECKING:
    from .application import Application
    from .event import Event
    from .swag_tier import SwagTier, SwagTierList


class Role(Enum):
    """
    The different permissions that can be assigned to a user
    """

    Participant = "participant"
    Sponsor = "sponsor"
    Organizer = "organizer"


class ParticipantBase(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr

    role: Role = Field(
        sa_column=Column(
            SqlEnum(Role),
            server_default=Role.Participant.value,
            nullable=False,
        ),
        default=Role.Participant,
    )


class Participant(ParticipantBase, table=True):
    __tablename__ = "participants"

    id: int = Field(default=None, primary_key=True, nullable=False)

    swag_tier_id: Optional[int] = Field(foreign_key="swag_tiers.id")
    swag_tier: Optional["SwagTier"] = Relationship(back_populates="participants")

    application: Optional["Application"] = Relationship(
        back_populates="participant",
        sa_relationship_kwargs={"cascade": "all, delete", "uselist": False},
    )

    attended: List["Event"] = Relationship(
        back_populates="attendees",
        link_model=EventAttendance,
    )


class ParticipantCreate(SQLModel):
    first_name: str
    last_name: str


class ParticipantList(ParticipantBase):
    id: int


class ParticipantRead(ParticipantList):
    swag_tier: Optional["SwagTierList"]


class ParticipantUpdate(SQLModel):
    first_name: Optional[str]
    last_name: Optional[str]
