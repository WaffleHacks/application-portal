from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application, ApplicationList


class SchoolBase(SQLModel):
    name: str


class School(SchoolBase, table=True):
    __tablename__ = "schools"

    id: Optional[str] = Field(default=None, primary_key=True, nullable=False)

    applications: List["Application"] = Relationship(back_populates="school")


class SchoolCreate(SchoolBase):
    abbreviations: List[str] = []
    alternatives: List[str] = []


class SchoolList(SchoolBase):
    id: str


class SchoolRead(SchoolBase):
    id: str
    applications: List["ApplicationList"]


class SchoolUpdate(SQLModel):
    name: Optional[str]
