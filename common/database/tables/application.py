from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .country import Country
    from .participant import Participant
    from .school import School


class Gender(Enum):
    MALE = 1
    FEMALE = 2
    NON_BINARY = 3
    OTHER = 4


# Names from https://boards.cdn.greenhouse.io/docs/RaceEthnicityDefinitions.pdf
class RaceEthnicity(Enum):
    AMERICAN_INDIAN = 1  # American Indian or Alaskan Native
    ASIAN = 2  # Asian
    PACIFIC_ISLANDER = 3  # Native Hawaiian or Other Pacific Islander
    BLACK = 4  # Black or African American
    HISPANIC = 5  # Hispanic or Latino
    CAUCASIAN = 6  # White / Caucasian
    MULTIPLE_OTHER = 7  # Multiple ethnicities / Other


class ApplicationBase(SQLModel):
    school_id: int = Field(foreign_key="schools.id")
    level_of_study: str
    graduation_year: int
    major: Optional[str]

    hackathons_attended: int
    portfolio_url: Optional[str]
    vcs_url: Optional[str]

    gender: Optional[Gender] = Field(sa_column=Column(SQLEnum(Gender)))
    date_of_birth: str
    race_ethnicity: Optional[RaceEthnicity] = Field(
        sa_column=Column(SQLEnum(RaceEthnicity))
    )

    country_id: int = Field(foreign_key="countries.id")
    shipping_address: Optional[str]  # should be formatted prior to insertion

    share_information: bool

    # TODO: figure out resume stuff

    legal_agreements_acknowledged: bool = Field(default=False, nullable=False)


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
    country: "Country" = Relationship(back_populates="applications")


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    participant_id: str


class ApplicationUpdate(SQLModel):
    school_id: Optional[int]
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
    country_id: Optional[int]

    share_information: Optional[bool]

    legal_agreements_acknowledged: Optional[bool]
