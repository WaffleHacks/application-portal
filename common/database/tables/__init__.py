from .application import (
    Application,
    ApplicationAutosave,
    ApplicationCreate,
    ApplicationList,
    ApplicationRead,
    ApplicationUpdate,
    Gender,
    RaceEthnicity,
)
from .message import Message, MessageBase, MessageCreate, MessageRead, MessageUpdate
from .participant import Participant, ParticipantBase, ParticipantRead
from .recipient import Group, Recipient, RecipientRead
from .school import (
    School,
    SchoolBase,
    SchoolCreate,
    SchoolList,
    SchoolRead,
    SchoolUpdate,
)

# Update hydrated references
ApplicationList.update_forward_refs(ParticipantRead=ParticipantRead)
ApplicationRead.update_forward_refs(
    ParticipantRead=ParticipantRead, SchoolList=SchoolList
)
MessageCreate.update_forward_refs(Group=Group)
MessageRead.update_forward_refs(RecipientRead=RecipientRead)
SchoolRead.update_forward_refs(ApplicationList=ApplicationList)
