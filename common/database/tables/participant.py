from typing import TYPE_CHECKING

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application


class Participant(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr

    application: "Application" = Relationship(back_populates="participant")


class ParticipantWithId(Participant, table=True):
    __tablename__ = "participants"

    id: int = Field(primary_key=True)
