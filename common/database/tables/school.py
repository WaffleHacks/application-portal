from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


class School(SQLModel, table=True):
    __tablename__ = "schools"

    id: int = Field()
