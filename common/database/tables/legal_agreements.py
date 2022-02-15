from typing import Optional

from sqlmodel import Field, SQLModel


class LegalAgreementBase(SQLModel):
    name: str
    content: str


class LegalAgreement(LegalAgreementBase, table=True):
    __tablename__ = "legal_agreements"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)


class LegalAgreementCreate(LegalAgreementBase):
    pass


class LegalAgreementRead(LegalAgreementBase):
    id: int


class LegalAgreementUpdate(SQLModel):
    name: Optional[str]
    content: Optional[str]
