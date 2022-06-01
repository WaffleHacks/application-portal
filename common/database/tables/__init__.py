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
from .participant import Participant, ParticipantBase, ParticipantList, ParticipantRead
from .recipient import Group, Recipient, RecipientCreate, RecipientRead
from .school import School, SchoolCreate, SchoolList, SchoolRead, SchoolUpdate
from .swag_tier import (
    SwagTier,
    SwagTierCreate,
    SwagTierList,
    SwagTierRead,
    SwagTierUpdate,
)

# Update hydrated references
ApplicationList.update_forward_refs(ParticipantList=ParticipantList)
ApplicationRead.update_forward_refs(
    ParticipantList=ParticipantList, SchoolList=SchoolList
)
MessageCreate.update_forward_refs(Group=Group)
MessageRead.update_forward_refs(RecipientRead=RecipientRead)
MessageTriggerRead.update_forward_refs(MessageList=MessageList)
MessageUpdate.update_forward_refs(Group=Group)
ParticipantRead.update_forward_refs(SwagTierList=SwagTierList)
SchoolRead.update_forward_refs(ApplicationList=ApplicationList)
SwagTierRead.update_forward_refs(ParticipantList=ParticipantList)
