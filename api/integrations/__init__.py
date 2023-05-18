from fastapi import APIRouter

from . import webhooks

router = APIRouter()
router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
