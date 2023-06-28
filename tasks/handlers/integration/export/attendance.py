from sqlalchemy import Integer, case, cast, extract, func
from sqlalchemy.future import select

from common.database import (
    Application,
    ApplicationStatus,
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
        .where(Application.status == ApplicationStatus.ACCEPTED)
    )


class Events(Exporter):
    header = ["Name", "Attended"]
    statement = (
        select(Event.name, func.count(EventAttendance.participant_id))
        .join_from(Event, EventAttendance)
        .group_by(Event.name)
    )


class EventFeedback(Exporter):
    header = [
        "Name",
        "Avg presentation rating",
        "Avg content rating",
        "Avg interest rating",
        "Do next year?",
    ]
    statement = (
        select(
            Event.name,
            func.coalesce(func.avg(Feedback.presentation), 0),
            func.coalesce(func.avg(Feedback.content), 0),
            func.coalesce(func.avg(Feedback.interest), 0),
            func.avg(case((Feedback.again, 1), else_=0)),
        )
        .join_from(Event, Feedback)
        .group_by(Event.name)
    )
