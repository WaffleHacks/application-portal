import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Awaitable, Callable, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from common.database import Export, ExportStatus, db_context

from .applications import MLHRegistered, ResumeBook
from .base import Exporter

manual = True

logger = logging.getLogger(__name__)


EXPORTERS: Dict[str, Dict[str, Exporter]] = {
    "applications": {
        "mlh-registered": MLHRegistered(),
        "resume-book": ResumeBook(),
    }
}


async def handler(export_id: int, table: str, kind: str):
    async with db_context() as db:
        export = await db.get(Export, export_id)
        if export is None:
            logger.warning(f"export {export_id} no longer exists")
            return

        table_exporters = EXPORTERS.get(table)
        if table_exporters is None:
            logger.warning(f"exporter does not exist for table {table!r}")
            await mark_export(ExportStatus.FAILED, export, db)
            return

        exporter = table_exporters.get(kind)
        if exporter is None:
            logger.warning(f"exporter {kind!r} does not exist on table {table!r}")
            await mark_export(ExportStatus.FAILED, export, db)
            return

        csv = await exporter.export(db)

        # TODO: upload to S3

        await mark_export(ExportStatus.COMPLETED, export, db)


async def mark_export(status: ExportStatus, export: Export, db: AsyncSession):
    export.status = status
    export.finished_at = datetime.now()

    db.add(export)
    await db.commit()
