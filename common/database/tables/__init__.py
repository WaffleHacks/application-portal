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
from .participant import Participant, ParticipantBase, ParticipantRead
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
SchoolRead.update_forward_refs(ApplicationList=ApplicationList)
