from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .participant import Participant, ParticipantList


class SwagTierBase(SQLModel):
    name: str
    description: str

    required_attendance: int


class SwagTier(SwagTierBase, table=True):
    __tablename__ = "swag_tiers"

    id: int = Field(default=None, primary_key=True, nullable=False)

    participants: List["Participant"] = Relationship(back_populates="swag_tier")


class SwagTierCreate(SwagTierBase):
    pass


class SwagTierList(SQLModel):
    id: int

    name: str
    required_attendance: int


class SwagTierListWithDescription(SwagTierList):
    description: str


class SwagTierRead(SwagTierBase):
    id: int

    participants: List["ParticipantList"]


class SwagTierUpdate(SQLModel):
    name: Optional[str]
    description: Optional[str]

    required_attendance: Optional[int]
