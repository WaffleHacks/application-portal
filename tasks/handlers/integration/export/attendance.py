from sqlalchemy.future import select

from common.database import Participant

from .base import Exporter


class CheckIns(Exporter):
    header = ["First name", "Last name", "Email"]
    statement = select(
        Participant.first_name, Participant.last_name, Participant.email
    ).where(Participant.checked_in)
