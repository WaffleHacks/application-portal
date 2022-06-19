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
from .application import Status as ApplicationStatus
from .event import Event, EventCreate, EventList, EventRead, EventUpdate
from .event_attendance import EventAttendance
from .feedback import Feedback, FeedbackCreate, FeedbackList, FeedbackRead
from .message import (
    Message,
    MessageBase,
    MessageCreate,
    MessageList,
    MessageRead,
    MessageUpdate,
)
from .message import Status as MessageStatus
from .message_trigger import (
    MessageTrigger,
    MessageTriggerRead,
    MessageTriggerType,
    MessageTriggerUpdate,
)
from .participant import Participant, ParticipantBase, ParticipantList, ParticipantRead
from .recipient import Group, Recipient, RecipientCreate, RecipientRead
from .school import School, SchoolCreate, SchoolList, SchoolRead, SchoolUpdate
from .settings import Settings as ApplicationSettings
from .swag_tier import (
    SwagTier,
    SwagTierCreate,
    SwagTierList,
    SwagTierListWithDescription,
    SwagTierRead,
    SwagTierUpdate,
)

# Update hydrated references
ApplicationList.update_forward_refs(ParticipantList=ParticipantList)
ApplicationRead.update_forward_refs(
    ParticipantList=ParticipantList,
    SchoolList=SchoolList,
)
EventRead.update_forward_refs(
    FeedbackList=FeedbackList,
    ParticipantList=ParticipantList,
)
FeedbackList.update_forward_refs(ParticipantList=ParticipantList)
FeedbackRead.update_forward_refs(EventList=EventList, ParticipantList=ParticipantList)
MessageCreate.update_forward_refs(Group=Group)
MessageRead.update_forward_refs(RecipientRead=RecipientRead)
MessageTriggerRead.update_forward_refs(MessageList=MessageList)
MessageUpdate.update_forward_refs(Group=Group)
ParticipantRead.update_forward_refs(SwagTierList=SwagTierList)
SchoolRead.update_forward_refs(ApplicationList=ApplicationList)
SwagTierRead.update_forward_refs(ParticipantList=ParticipantList)
