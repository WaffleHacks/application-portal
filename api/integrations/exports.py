from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.permissions import Role, requires_role
from api.session import with_user_id
from common.aws import S3Client, with_s3
from common.database import (
    Export,
    ExportCreate,
    ExportList,
    ExportStatus,
    Participant,
    with_db,
)
from common.settings import SETTINGS
from common.tasks import tasks

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])


@router.get("/", name="List exports", response_model=List[ExportList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the exports
    """
    result = await db.execute(select(Export))
    return result.scalars().all()


@router.post("/", name="Create export", response_model=ExportList)
async def create(
    values: ExportCreate,
    user_id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Create a new export
    """
    user = await db.get(Participant, user_id)
    assert user is not None

    export = Export(name=values.name, requester=user.email)

    db.add(export)
    await db.commit()

    await tasks.integration.export(
        export_id=export.id,
        table=values.table,
        kind=values.kind,
    )

    return export


class GetExportResponse(BaseModel):
    url: str


@router.get("/{id}/download", name="Read export", response_model=GetExportResponse)
async def download(
    id: int,
    db: AsyncSession = Depends(with_db),
    s3: S3Client = Depends(with_s3),
):
    """
    Get a download url for the exported data
    """
    export = await db.get(Export, id)
    if export is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    if export.status == ExportStatus.PROCESSING:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="export is still processing"
        )
    elif export.status == ExportStatus.FAILED:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="export failed")

    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": SETTINGS.export_bucket, "Key": export.file},
        ExpiresIn=15 * 60,
    )
    return {"url": url}
