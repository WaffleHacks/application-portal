from sqlalchemy import func
from sqlalchemy.future import select

from common.database import Event, EventAttendance, Feedback, Participant

from .base import Exporter


class CheckIns(Exporter):
    header = ["First name", "Last name", "Email"]
    statement = select(
        Participant.first_name, Participant.last_name, Participant.email
    ).where(Participant.checked_in)


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
