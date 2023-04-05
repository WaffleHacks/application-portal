from fastapi import APIRouter

from . import messages, triggers

router = APIRouter()
router.include_router(messages.router, prefix="/messages", tags=["Messages"])
router.include_router(triggers.router, prefix="/triggers", tags=["Triggers"])
