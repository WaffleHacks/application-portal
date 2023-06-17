from sqlalchemy import Integer, cast, extract, func
from sqlalchemy.future import select

from common.database import (
    Application,
    Event,
    EventAttendance,
    Feedback,
    Participant,
    School,
)

from .base import Exporter


class CheckIns(Exporter):
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
        .where(Participant.checked_in)
    )


class Events(Exporter):
    header = [
        "Name",
        "Attended",
        "Avg Presentation Rating",
        "Avg Content Rating",
        "Avg Interest Rating",
    ]
    statement = (
        select(
            Event.name,
            func.count(EventAttendance.participant_id),
            func.coalesce(func.avg(Feedback.presentation), 0),
            func.coalesce(func.avg(Feedback.content), 0),
            func.coalesce(func.avg(Feedback.interest), 0),
        )
        .join_from(Event, EventAttendance)
        .join_from(Event, Feedback, full=True)
        .group_by(Event.name)
    )
