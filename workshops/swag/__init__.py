from fastapi import APIRouter

from . import tiers

router = APIRouter()

router.include_router(tiers.router, prefix="/tiers", tags=["Swag Tiers"])
