from fastapi import APIRouter

from . import exports, webhooks

router = APIRouter()
router.include_router(exports.router, prefix="/exports", tags=["Exports"])
router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
