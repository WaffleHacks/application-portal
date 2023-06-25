import codecs
from csv import DictReader
from http import HTTPStatus
from io import BytesIO
from typing import Dict, List, Literal, Union
from uuid import uuid4

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.permissions import Role, requires_role
from common.aws import S3Client, with_s3
from common.kv import NamespacedClient, with_kv
from common.settings import SETTINGS
from common.tasks import tasks

Utf8StreamReader = codecs.getreader("utf-8")

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])


class PreSignedURL(BaseModel):
    name: str
    url: str
    fields: Dict[str, str]


@router.get(
    "/upload",
    name="Get an upload URL for the DevPost CSV",
    response_model=PreSignedURL,
)
async def upload(s3: S3Client = Depends(with_s3)):
    """
    Get a S3 pre-signed URL for uploading the DevPost judging CSV for processing
    """
    key = f"judging-{uuid4()}"
    pre_signed = s3.generate_presigned_post(
        SETTINGS.export_bucket,
        key,
        Conditions=[
            {"acl": "private"},
            {"success_action_status": "201"},
            ["starts-with", "$key", ""],
            ["content-length-range", 0, 10 * 1024 * 1024],
            {"content-type": "text/csv"},
            {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
        ],
        ExpiresIn=5 * 60,
    )

    pre_signed["name"] = key

    return pre_signed


@router.get("/{name}/headers", name="Get CSV headers", response_model=List[str])
async def headers(name: str, s3: S3Client = Depends(with_s3)):
    try:
        result = BytesIO()
        s3.download_fileobj(SETTINGS.export_bucket, name, result)
    except ClientError as e:
        if e.response.get("Error", {}).get("Code", "") == "404":
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

        raise e

    result.seek(0)
    encoded = Utf8StreamReader(result)

    reader = DictReader(encoded)
    return reader.fieldnames


class ProcessColumns(BaseModel):
    name: str
    url: str
    project_status: str
    judging_status: str
    submission_code: str


@router.put(
    "/{name}/process",
    name="Start the processing",
    status_code=HTTPStatus.CREATED,
)
async def process(
    name: str,
    columns: ProcessColumns,
    kv: NamespacedClient = Depends(with_kv("judging")),
    s3: S3Client = Depends(with_s3),
):
    try:
        s3.head_object(Bucket=SETTINGS.export_bucket, Key=name)
    except ClientError as e:
        if e.response.get("Error", {}).get("Code", "") == "404":
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

        raise e

    await kv.set(name, {"columns": columns, "status": "pending"})
    await tasks.integration.process_judging(file=name)


class ProcessingStatus(BaseModel):
    status: str


@router.get(
    "/{name}/process",
    name="Get processing status",
    response_model=ProcessingStatus,
)
async def processing_status(
    name: str,
    kv: NamespacedClient = Depends(with_kv("judging")),
):
    raw = await kv.get(name)
    if raw is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return ProcessingStatus.parse_raw(raw)


class SuccessResult(BaseModel):
    status: Literal["success"]
    valid: str
    invalid: str


class FailureResult(BaseModel):
    status: Literal["failure"]
    reason: str


@router.get(
    "/{name}/result",
    name="Get judging result",
    response_model=Union[SuccessResult, FailureResult],
)
async def result(
    name: str,
    kv: NamespacedClient = Depends(with_kv("judging")),
    s3: S3Client = Depends(with_s3),
):
    raw = await kv.get(name, is_json=True)
    if raw is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    status = raw.get("status", "pending")
    if status == "pending":
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="processing not complete",
        )

    if status == "failure":
        return raw

    assert status == "success"

    valid = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": SETTINGS.export_bucket, "Key": raw["valid"]},
        ExpiresIn=15 * 60,
    )
    invalid = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": SETTINGS.export_bucket, "Key": raw["invalid"]},
        ExpiresIn=15 * 60,
    )

    return {"status": "success", "valid": valid, "invalid": invalid}
