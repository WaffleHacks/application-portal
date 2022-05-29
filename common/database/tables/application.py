from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel, validator
from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String
from sqlmodel import Field, Relationship, SQLModel

from .types import TimeStamp

if TYPE_CHECKING:
    from .participant import Participant, ParticipantRead
    from .school import School, SchoolList


class Gender(Enum):
    MALE = "Male"
    FEMALE = "Female"
    NON_BINARY = "Non-binary"
    OTHER = "Other"


# Names from https://boards.cdn.greenhouse.io/docs/RaceEthnicityDefinitions.pdf
class RaceEthnicity(Enum):
    AMERICAN_INDIAN = "American Indian / Alaskan Native"
    ASIAN = "Asian"
    PACIFIC_ISLANDER = "Native Hawaiian or other pacific islander"
    BLACK = "Black / African American"
    HISPANIC = "Hispanic / Latino"
    CAUCASIAN = "White / Caucasian"
    MULTIPLE_OTHER = "Multiple ethnicities / Other"


class Status(Enum):
    PENDING = "pending"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


def require_legal_agreements(v: bool) -> bool:
    if v is False:
        raise ValueError("legal agreements must be accepted to apply")
    return v


class ApplicationProfileBase(SQLModel):
    level_of_study: str
    graduation_year: int
    major: Optional[str]

    hackathons_attended: int
    portfolio_url: Optional[str]
    vcs_url: Optional[str]

    gender: Gender = Field(sa_column=Column(SQLEnum(Gender), nullable=False))
    date_of_birth: str
    race_ethnicity: RaceEthnicity = Field(
        sa_column=Column(SQLEnum(RaceEthnicity), nullable=False)
    )

    country: str
    shipping_address: Optional[str]  # should be formatted prior to insertion

    phone_number: str

    share_information: bool

    legal_agreements_acknowledged: bool = Field(default=False, nullable=False)
    _legal_agreements_validator = validator(
        "legal_agreements_acknowledged", allow_reuse=True
    )(require_legal_agreements)


class ApplicationBase(ApplicationProfileBase):
    notes: str = Field(default="", nullable=False)
    draft_status: Status = Field(
        sa_column=Column(
            SQLEnum(Status), nullable=False, server_default=Status.PENDING.name
        )
    )
    status: Status = Field(
        sa_column=Column(
            SQLEnum(Status), nullable=False, server_default=Status.PENDING.name
        )
    )

    school_id: str = Field(foreign_key="schools.id")

    resume: Optional[str]
    created_at: Optional[datetime] = Field(
        sa_column=Column(
            TimeStamp(timezone=True),
            default=datetime.now,
            nullable=False,
        )
    )


class Application(ApplicationBase, table=True):
    __tablename__ = "applications"

    participant_id: str = Field(
        sa_column=Column(
            String(),
            ForeignKey("participants.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )
    participant: "Participant" = Relationship(back_populates="application")

    school: "School" = Relationship(back_populates="applications")


class ApplicationCreate(ApplicationProfileBase):
    school: str

    resume: bool


class ApplicationList(SQLModel):
    participant: "ParticipantRead"

    country: str
    status: Status

    created_at: datetime


class ApplicationRead(ApplicationProfileBase):
    participant: "ParticipantRead"

    school: "SchoolList"
    resume: Optional[str]

    status: Status

    created_at: datetime


class ApplicationUpdate(SQLModel):
    school_id: Optional[str]
    level_of_study: Optional[str]
    graduation_year: Optional[int]
    major: Optional[str]

    gender: Optional[Gender]
    date_of_birth: Optional[str]
    race_ethnicity: Optional[RaceEthnicity]

    hackathons_attended: Optional[int]
    portfolio_url: Optional[str]
    vcs_url: Optional[str]

    shipping_address: Optional[str]  # should be formatted prior to insertion
    country: Optional[str]

    phone_number: Optional[str]

    share_information: Optional[bool]

    legal_agreements_acknowledged: Optional[bool]
    _legal_agreements_validator = validator(
        "legal_agreements_acknowledged", allow_reuse=True
    )(require_legal_agreements)


class ApplicationAutosaveResume(BaseModel):
    path: str


class ApplicationAutosave(BaseModel):
    phone_number: str = ""
    gender: str = ""
    race_ethnicity: str = ""
    date_of_birth: str = ""

    school: str = ""
    level_of_study: str = ""
    graduation_year: int = 2022
    major: str = ""

    street: str = ""
    apartment: str = ""
    city: str = ""
    region: str = ""
    postal_code: str = ""
    country: str = ""

    portfolio_url: str = ""
    vcs_url: str = ""
    hackathons_attended: int = datetime.now().year
    resume: Optional[ApplicationAutosaveResume]
    share_information: bool = True

    agree_to_privacy: bool = False
    agree_to_rules: bool = False

    mlh_code_of_conduct: bool = False
    mlh_event_logistics_information: bool = False
    mlh_communications: bool = False
