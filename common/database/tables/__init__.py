from .application import (
    Application,
    ApplicationAutosave,
    ApplicationCreate,
    ApplicationList,
    ApplicationRead,
    ApplicationUpdate,
    Gender,
    RaceEthnicity,
    Status,
)
from .event import Event, EventCreate, EventList, EventRead, EventUpdate
from .message import (
    Message,
    MessageBase,
    MessageCreate,
    MessageList,
    MessageRead,
    MessageUpdate,
)
from .message_trigger import (
    MessageTrigger,
    MessageTriggerRead,
    MessageTriggerType,
    MessageTriggerUpdate,
)
from .participant import Participant, ParticipantBase, ParticipantRead
from .recipient import Group, Recipient, RecipientCreate, RecipientRead
from .school import School, SchoolCreate, SchoolList, SchoolRead, SchoolUpdate

# Update hydrated references
ApplicationList.update_forward_refs(ParticipantRead=ParticipantRead)
ApplicationRead.update_forward_refs(
    ParticipantRead=ParticipantRead, SchoolList=SchoolList
)
MessageCreate.update_forward_refs(Group=Group)
MessageRead.update_forward_refs(RecipientRead=RecipientRead)
MessageTriggerRead.update_forward_refs(MessageList=MessageList)
MessageUpdate.update_forward_refs(Group=Group)
SchoolRead.update_forward_refs(ApplicationList=ApplicationList)
