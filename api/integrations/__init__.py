from fastapi import APIRouter

from . import discord

router = APIRouter()
router.include_router(discord.router, prefix="/discord", tags=["Discord"])
