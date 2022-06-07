from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import AutoString, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application, ApplicationList


class SchoolBase(SQLModel):
    name: str

    abbreviations: List[str] = Field(
        default=[],
        sa_column=Column(ARRAY(AutoString()), nullable=False),
    )
    alternatives: List[str] = Field(
        default=[],
        sa_column=Column(ARRAY(AutoString()), nullable=False),
    )


class School(SchoolBase, table=True):
    __tablename__ = "schools"

    id: Optional[str] = Field(default=None, primary_key=True, nullable=False)
    needs_review: bool = False

    applications: List["Application"] = Relationship(back_populates="school")


class SchoolCreate(SchoolBase):
    pass


class SchoolList(SQLModel):
    id: str
    name: str
    needs_review: bool


class SchoolRead(SchoolBase):
    id: str
    needs_review: bool
    applications: List["ApplicationList"]


class SchoolUpdate(SQLModel):
    name: Optional[str]

    needs_review: Optional[bool]

    abbreviations: Optional[List[str]]
    alternatives: Optional[List[str]]
