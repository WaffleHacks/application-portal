from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .country import Country
    from .participant import Participant
    from .school import School


class Gender(Enum):
    MALE = 1
    FEMALE = 2
    NON_BINARY = 3


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
    participant: "Participant" = Relationship(back_populates="application")

    school_id: int = Field(foreign_key="schools.id")
    school: "School" = Relationship(back_populates="applications")
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
    country: "Country" = Relationship(back_populates="applications")
    shipping_address: Optional[str]  # should be formatted prior to insertion

    share_information: bool

    # TODO: figure out resume stuff

    # TODO: link to legal agreements


class Application(ApplicationBase, table=True):
    __tablename__ = "applications"

    participant_id: int = Field(primary_key=True,
                                foreign_key="participants.id")


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    id: int


class ApplicationUpdate(SQLModel):
    participant: Optional[Participant]

    school_id: Optional[int]
    school: Optional[School]
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
    country: Optional[Country]

    share_information: Optional[bool]
