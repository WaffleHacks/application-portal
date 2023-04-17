from fastapi import APIRouter

from . import applications, bulk, participants, schools

router = APIRouter()
router.include_router(
    applications.router, prefix="/applications", tags=["Applications"]
)
router.include_router(bulk.router, prefix="/bulk", tags=["Bulk"])
router.include_router(
    participants.router, prefix="/participants", tags=["Participants"]
)
router.include_router(schools.router, prefix="/schools", tags=["Schools"])