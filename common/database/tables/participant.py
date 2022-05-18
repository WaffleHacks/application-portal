from typing import TYPE_CHECKING, Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application
    from .discord_link import DiscordLink


class ParticipantBase(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr


class Participant(ParticipantBase, table=True):
    __tablename__ = "participants"

    id: str = Field(default=None, primary_key=True, nullable=False)

    application: Optional["Application"] = Relationship(
        back_populates="participant", sa_relationship_kwargs={"cascade": "all, delete"}
    )
    discord: Optional["DiscordLink"] = Relationship(
        back_populates="participant", sa_relationship_kwargs={"cascade": "all, delete"}
    )


class ParticipantRead(ParticipantBase):
    id: str
