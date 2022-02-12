from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .participant import Participant


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


class Application(SQLModel, table=True):
    __tablename__ = "applications"

    participant_id: int = Field(
        default=None, primary_key=True, foreign_key="participants.id"
    )
    participant: "Participant" = Relationship(back_populates="application")

    # TODO: link to school
    level_of_study: str
    graduation_year: int
    major: Optional[str]

    gender: Optional[Gender] = Field(sa_column=Column(SQLEnum(Gender)))
    date_of_birth: str
    race_ethnicity: Optional[RaceEthnicity] = Field(
        sa_column=Column(SQLEnum(RaceEthnicity))
    )

    hackathons_attended: int
    portfolio_url: Optional[str]
    vcs_url: Optional[str]

    shipping_address: Optional[str]  # this should be formatted prior to insertion
    # TODO: link to country

    share_information: bool
    # TODO: figure out resume stuff

    # TODO: link to legal agreements
