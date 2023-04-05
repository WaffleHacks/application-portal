from fastapi import APIRouter

from . import settings

router = APIRouter()
router.include_router(settings.router, prefix="/settings", tags=["Settings"])
