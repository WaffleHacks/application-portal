from typing import Optional

from sqlmodel import Field, SQLModel


class LegalAgreement(SQLModel, table=True):
    __tablename__ = "legal_agreements"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)

    name: str
    content: str
