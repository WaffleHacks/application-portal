import codecs
import logging
from csv import DictReader, DictWriter, excel
from io import BytesIO, StringIO
from typing import Dict, List, Optional, Tuple

from botocore.exceptions import ClientError
from opentelemetry import trace
from pydantic import BaseModel, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.aws import with_s3
from common.database import Application, ApplicationStatus, Participant, db_context
from common.kv import engine
from common.settings import SETTINGS

manual = True

logger = logging.getLogger(__name__)
kv = engine.namespaced("judging")
s3 = with_s3()

Utf8StreamReader = codecs.getreader("utf-8")

VALID_FIELDS = [
    "Name",
    "URL",
    "Participant 1",
    "Participant 2",
    "Participant 3",
    "Participant 4",
]
INVALID_FIELDS = ["Name", "URL", "Reason"]


class Columns(BaseModel):
    name: str
    url: str
    project_status: str
    judging_status: str
    submission_code: str


class Data(BaseModel):
    columns: Columns
    status: str


async def handler(file: str):
    logger.info(f"processing judging data {file!r}")
    trace.get_current_span().set_attribute("file", file)

    try:
        data = await load_columns(file)
        if data is None:
            return

        reader = open_source(file)
        if reader is None:
            return

        valid_writer, valid_buffer = create_writer(VALID_FIELDS)
        invalid_writer, invalid_buffer = create_writer(INVALID_FIELDS)

        async with db_context() as db:
            for row in reader:
                valid, processed = await process_row(row, data.columns, db)
                if valid:
                    valid_writer.writerow(processed)
                else:
                    invalid_writer.writerow(processed)

        write_result(file + "-valid", valid_buffer)
        write_result(file + "-invalid", invalid_buffer)
        await kv.set(
            file,
            {
                "status": "success",
                "valid": file + "-valid",
                "invalid": file + "-invalid",
            },
        )

    except Exception as e:
        await kv.set(file, {"status": "failure", "reason": str(e)})

        raise e


async def process_row(
    row: Dict[str, str],
    columns: Columns,
    db: AsyncSession,
) -> Tuple[bool, Dict[str, str]]:
    name = row[columns.name]
    url = row[columns.url]

    if row[columns.project_status] != "Submitted (Gallery/Visible)":
        return False, {
            "Name": name,
            "URL": url,
            "Reason": f"project was not submitted (status: {row[columns.project_status]})",
        }

    if row[columns.judging_status] == "Don't judge":
        return False, {
            "Name": name,
            "URL": url,
            "Reason": "project marked as don't judge",
        }

    codes = set(row[columns.submission_code].replace(" ", "").split("-"))
    if len(codes) == 0 or len(codes) > 4:
        return False, {
            "Name": name,
            "URL": url,
            "Reason": f"invalid submission codes: {row[columns.submission_code]}",
        }

    query_result = await db.execute(
        select(Participant)
        .where(Participant.id == Application.participant_id)
        .where(Application.status == ApplicationStatus.ACCEPTED)
        .where(Participant.project_code.in_(codes))  # type: ignore
    )
    participants = query_result.scalars().all()

    result = {"Name": name, "URL": url}
    i = 0
    for i, p in enumerate(participants):
        codes.remove(p.project_code)
        result[f"Participant {i+1}"] = f"{p.first_name} {p.last_name} (ID: {p.id})"

    if len(codes) > 0:
        return False, {
            "Name": name,
            "URL": url,
            "Reason": f"unknown submission codes: {', '.join(codes)}",
        }

    for j in range(i + 1, 4):
        result[f"Participant {j+1}"] = ""

    return True, result


async def load_columns(file: str) -> Optional[Data]:
    raw = await kv.get(file)
    if raw is None:
        logger.info(f"kv data not found for file {file!r}")
        return None

    try:
        data = Data.parse_raw(raw)
    except ValidationError as e:
        logger.error(f"invalid data format: {e}")
        return None

    return data


def open_source(file: str) -> Optional[DictReader]:
    try:
        raw_csv = BytesIO()
        s3.download_fileobj(SETTINGS.export_bucket, file, raw_csv)
    except ClientError as e:
        if e.response.get("Error", {}).get("Code", "") == "404":
            logger.info(f"file not found in S3")
            return None

        raise e

    raw_csv.seek(0)
    encoded = Utf8StreamReader(raw_csv)
    return DictReader(encoded)


def create_writer(fields: List[str]) -> Tuple[DictWriter, StringIO]:
    buffer = StringIO()
    writer = DictWriter(buffer, fieldnames=fields, extrasaction="ignore", dialect=excel)
    writer.writeheader()

    return writer, buffer


def write_result(name: str, buffer: StringIO):
    s3.put_object(
        Bucket=SETTINGS.export_bucket,
        Key=name,
        Body=buffer.getvalue(),
        ACL="private",
        ContentType="text/csv",
    )
