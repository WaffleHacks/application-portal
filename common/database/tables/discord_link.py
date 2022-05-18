from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, ForeignKey, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .participant import Participant


class DiscordLinkBase(SQLModel):
    id: str

    username: str
    discriminator: str

    agreed_to_rules: bool = Field(default=False)


class DiscordLink(DiscordLinkBase, table=True):
    __tablename__ = "discord_links"

    participant_id: str = Field(
        sa_column=Column(
            String(),
            ForeignKey("participants.id", ondelete="CASCADE"),
            primary_key=True,
        )
    )
    participant: "Participant" = Relationship(back_populates="discord")


class DiscordLinkRead(DiscordLinkBase):
    pass


class DiscordLinkUpdate(SQLModel):
    agreed_to_rules: Optional[bool]
