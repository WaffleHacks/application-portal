import logging
from datetime import datetime
from typing import Dict
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from common.aws import with_s3
from common.database import Export, ExportStatus, db_context
from common.settings import SETTINGS

from .applications import All, MLHRegistered, ResumeBook
from .attendance import CheckIns, EventFeedback, Events, SwagTiers
from .base import Exporter

manual = True

logger = logging.getLogger(__name__)
s3 = with_s3()


EXPORTERS: Dict[str, Dict[str, Exporter]] = {
    "applications": {
        "all": All(),
        "mlh-registered": MLHRegistered(),
        "resume-book": ResumeBook(),
    },
    "attendance": {
        "check-ins": CheckIns(),
        "events": Events(),
        "event-feedback": EventFeedback(),
        "swag-tiers": SwagTiers(),
    },
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

        filename = str(uuid4()) + ".csv"
        s3.put_object(
            Bucket=SETTINGS.export_bucket,
            Key=filename,
            Body=csv.getvalue(),
            ACL="private",
            ContentType="text/csv",
        )

        export.file = filename
        await mark_export(ExportStatus.COMPLETED, export, db)


async def mark_export(status: ExportStatus, export: Export, db: AsyncSession):
    export.status = status
    export.finished_at = datetime.now()

    db.add(export)
    await db.commit()
