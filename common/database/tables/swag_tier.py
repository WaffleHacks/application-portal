from typing import TYPE_CHECKING, List, Optional

from pydantic import validator
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .participant import Participant, ParticipantList


class SwagTierBase(SQLModel):
    name: str
    description: str

    required_attendance: int

    @validator("required_attendance")
    def non_negative(cls, value: int) -> int:
        if value < 0:
            raise ValueError("must be positive")
        return value


class SwagTier(SwagTierBase, table=True):
    __tablename__ = "swag_tiers"
    __table_args__ = (UniqueConstraint("required_attendance"),)

    id: int = Field(default=None, primary_key=True, nullable=False)

    participants: List["Participant"] = Relationship(
        back_populates="swag_tier", sa_relationship_kwargs={"cascade": "all"}
    )


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
