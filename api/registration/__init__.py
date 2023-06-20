from fastapi import APIRouter

from . import applications, bulk, check_ins, participants, schools

router = APIRouter()
router.include_router(
    applications.router, prefix="/applications", tags=["Applications"]
)
router.include_router(bulk.router, prefix="/bulk", tags=["Bulk"])
router.include_router(check_ins.router, prefix="/check-in", tags=["Check In"])
router.include_router(
    participants.router, prefix="/participants", tags=["Participants"]
)
router.include_router(schools.router, prefix="/schools", tags=["Schools"])
