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

    applications: List["Application"] = Relationship(back_populates="school")


class SchoolCreate(SchoolBase):
    pass


class SchoolList(SQLModel):
    id: str
    name: str


class SchoolRead(SchoolBase):
    id: str
    applications: List["ApplicationList"]


class SchoolUpdate(SQLModel):
    name: Optional[str]

    abbreviations: Optional[List[str]]
    alternatives: Optional[List[str]]
