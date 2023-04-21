from sqlalchemy.future import select

from .engine import db_context, with_db
from .tables import *


async def healthcheck():
    """
    Check that the database connection is healthy
    """
    async with db_context() as db:
        await db.execute(select(1))


async def warm_up():
    """
    Warm up the mapper to prevent a slow first query
    """
    async with db_context() as db:
        entry = ServiceSettings.accepting_applications(db)
        await entry.get()
