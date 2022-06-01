from typing import TYPE_CHECKING, Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application
    from .swag_tier import SwagTier, SwagTierList


class ParticipantBase(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr


class Participant(ParticipantBase, table=True):
    __tablename__ = "participants"

    id: str = Field(default=None, primary_key=True, nullable=False)

    swag_tier_id: Optional[int] = Field(foreign_key="swag_tiers.id")
    swag_tier: Optional["SwagTier"] = Relationship(back_populates="participants")

    application: Optional["Application"] = Relationship(
        back_populates="participant",
        sa_relationship_kwargs={"cascade": "all, delete", "uselist": False},
    )


class ParticipantList(ParticipantBase):
    id: str


class ParticipantRead(ParticipantList):
    swag_tier: Optional["SwagTierList"]
