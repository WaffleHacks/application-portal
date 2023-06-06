from collections.abc import Iterable
from csv import DictWriter, excel
from io import StringIO
from typing import Any, Dict, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.selectable import Select


class Exporter:
    header: List[str]
    statement: Select

    async def fetch_rows(self, db: AsyncSession) -> Iterable[Dict[str, Any]]:
        result = await db.execute(self.statement)
        return (dict(zip(self.header, row)) for row in result.all())

    async def export(self, db: AsyncSession) -> StringIO:
        buffer = StringIO()
        writer = DictWriter(
            buffer,
            fieldnames=self.header,
            extrasaction="ignore",
            dialect=excel,
        )

        rows = await self.fetch_rows(db)

        writer.writeheader()
        writer.writerows(rows)

        return buffer
