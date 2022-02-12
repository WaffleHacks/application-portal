from typing import Optional, no_type_check

from pydantic import AnyUrl


class PostgresDsn(AnyUrl):
    allowed_schemes = {"postgresql+asyncpg", "postgres", "postgresql"}
    user_required = True

    @no_type_check
    def __new__(cls, url: Optional[str], **kwargs):
        normalized = url.replace("postgres://", "postgresql+asyncpg://").replace(
            "postgresql://", "postgresql+asyncpg://"
        )
        return super(PostgresDsn, cls).__new__(cls, normalized, **kwargs)
