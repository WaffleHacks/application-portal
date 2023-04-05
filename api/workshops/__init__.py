from fastapi import APIRouter

from . import attendance, events, swag

router = APIRouter()
router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
router.include_router(events.router, prefix="/events", tags=["Events"])
router.include_router(swag.router, prefix="/swag", tags=["Swag"])
