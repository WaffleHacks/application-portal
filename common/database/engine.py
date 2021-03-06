from contextlib import asynccontextmanager
from typing import AsyncContextManager, AsyncGenerator, Callable

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from ..settings import SETTINGS

engine = create_async_engine(SETTINGS.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(
    engine,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
    class_=AsyncSession,
    future=True,
)


async def with_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Open a database session from the connection pool
    :return: a database session
    """
    try:
        async with SessionLocal() as session:
            yield session
    finally:
        await session.close()


# Required since FastAPI cannot use context managers as dependencies
# Relevant issue: https://github.com/tiangolo/fastapi/issues/2212
db_context: Callable[[], AsyncContextManager[AsyncSession]] = asynccontextmanager(
    with_db
)
