from sqlalchemy import Integer, cast, extract, func
from sqlalchemy.future import select

from common.database import Application, ApplicationStatus, Participant, School

from .base import Exporter


class MLHRegistered(Exporter):
    header = [
        "First name",
        "Last name",
        "Age",
        "Email",
        "School",
        "Phone number",
        "Country",
        "Level of study",
        "Acknowledged checkboxes",
    ]
    statement = (
        select(
            Participant.first_name,
            Participant.last_name,
            cast(extract("year", func.age(Application.date_of_birth)), Integer),
            Participant.email,
            School.name,
            Application.phone_number,
            Application.country,
            Application.level_of_study,
            Application.legal_agreements_acknowledged,
        )
        .join_from(Application, Participant)
        .join_from(Application, School)
    )


class ResumeBook(Exporter):
    header = [
        "First name",
        "Last name",
        "Email",
        "Age",
        "Country",
        "School",
        "Major",
        "Level of study",
        "Graduation year",
        "Portfolio URL",
        "VCS URL",
        "Has Resume?",
    ]
    statement = (
        select(
            Participant.first_name,
            Participant.last_name,
            Participant.email,
            cast(extract("year", func.age(Application.date_of_birth)), Integer),
            Application.country,
            School.name,
            Application.major,
            Application.level_of_study,
            Application.graduation_year,
            Application.portfolio_url,
            Application.vcs_url,
            Application.resume != None,
        )
        .join_from(Application, Participant)
        .join_from(Application, School)
        .where(Application.status == ApplicationStatus.ACCEPTED)
        .where(Application.share_information)
    )
