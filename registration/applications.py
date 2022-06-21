from http import HTTPStatus
from typing import Dict, List, Optional
from uuid import uuid4

import nanoid
from algoliasearch.search_index_async import SearchIndexAsync
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import BaseModel, validate_model
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common import SETTINGS
from common.algolia import with_schools_index
from common.authentication import with_user_id
from common.aws import S3Client, with_s3
from common.database import (
    Application,
    ApplicationAutosave,
    ApplicationCreate,
    ApplicationList,
    ApplicationRead,
    ApplicationStatus,
    ApplicationUpdate,
    Participant,
    ParticipantRead,
    School,
    ServiceSettings,
    with_db,
)
from common.kv import NamespacedClient, with_kv
from common.permissions import Permission, requires_permission
from common.tasks import broadcast


class S3PreSignedURL(BaseModel):
    url: str
    fields: Dict[str, str]


class CreateResponse(BaseModel):
    upload: Optional[S3PreSignedURL]


class GetResumeResponse(BaseModel):
    url: str


router = APIRouter()
tracer = trace.get_tracer(__name__)


@router.get(
    "/",
    response_model=List[ApplicationList],
    name="List applications",
)
async def list(
    permission: str = Depends(
        requires_permission(Permission.Sponsor, Permission.Organizer)
    ),
    db: AsyncSession = Depends(with_db),
):
    """
    List all applications in db
    """
    statement = (
        select(Application)
        .order_by(Application.created_at.desc())  # type: ignore
        .options(
            selectinload(Application.participant), selectinload(Application.school)
        )
    )
    if Permission.Sponsor.matches(permission):
        statement = statement.where(Application.share_information)

    result = await db.execute(statement)
    applications = result.scalars().all()
    return applications


@router.get(
    "/incomplete",
    response_model=List[ParticipantRead],
    name="List incomplete applications",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def list_incomplete(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all participants who have not completed their application
    """
    statement = (
        select(Participant)
        .outerjoin(Application, full=True)
        .where(Application.participant_id == None)
    )

    result = await db.execute(statement)
    participants = result.scalars().all()
    return participants


@router.post(
    "/",
    response_model=CreateResponse,
    status_code=HTTPStatus.CREATED,
    name="Create application",
    dependencies=[Depends(requires_permission(Permission.Participant))],
)
async def create_application(
    values: ApplicationCreate,
    id: str = Depends(with_user_id),
    s3: S3Client = Depends(with_s3),
    db: AsyncSession = Depends(with_db),
    kv: NamespacedClient = Depends(with_kv("autosave")),
    index: SearchIndexAsync = Depends(with_schools_index),
):
    """
    Create a new application attached to the currently authenticated participant
    """
    # Check if people can submit applications
    if not await ServiceSettings.accepting_applications(db).get():
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="applications are closed"
        )

    # Find the school by name
    with tracer.start_as_current_span("find-school"):
        statement = select(School).where(School.name == values.school)
        result = await db.execute(statement)
        school: Optional[School] = result.scalars().first()

        missing_school = school is None
        if missing_school:
            school = School(
                name=values.school, id=nanoid.generate(size=8), needs_review=True
            )
            db.add(school)

        assert school is not None

    # Generate a file name for the user's resume if they attempted to provide one
    resume = str(uuid4()) if values.resume else None

    try:
        application = Application.from_orm(
            values,
            {
                "participant_id": id,
                "school_id": school.id,
                "status": "pending",
                "resume": resume,
            },
        )

        # Flag the participant if their school was created later
        application.flagged = application.flagged or school.needs_review

        db.add(application)
        await db.commit()
    except IntegrityError:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail="already applied")

    # Delete the auto-save data
    await kv.delete(id)

    # Send the application received message
    await broadcast("registration", "new_application", participant_id=id)

    # Create the school in the index if its missing
    if missing_school:
        with tracer.start_as_current_span("create-in-index"):
            params = school.dict(exclude={"id"})
            params["objectID"] = school.id
            index.save_object(params)

    response = {}

    # Generate a URL to upload the participant's resume
    if application.resume:
        with tracer.start_as_current_span("upload-resume"):
            response["upload"] = s3.generate_presigned_post(
                SETTINGS.registration.bucket,
                application.resume,
                Conditions=[
                    {"acl": "private"},
                    {"success_action_status": "201"},
                    ["starts-with", "$key", ""],
                    ["content-length-range", 0, 10 * 1024 * 1024],
                    {"content-type": "application/pdf"},
                    {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
                ],
                ExpiresIn=5 * 60,
            )

    return response


@router.get(
    "/autosave",
    response_model=ApplicationAutosave,
    name="Get an in-progress application",
    dependencies=[Depends(requires_permission(Permission.Participant))],
)
async def get_autosave_application(
    id: str = Depends(with_user_id), kv: NamespacedClient = Depends(with_kv("autosave"))
):
    """
    Get the data for an in-progress application
    """
    autosave = await kv.get(str(id), is_json=True)
    if autosave:
        return autosave

    raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")


@router.put(
    "/autosave",
    status_code=HTTPStatus.NO_CONTENT,
    name="Save an in-progress application",
    dependencies=[Depends(requires_permission(Permission.Participant))],
)
async def autosave_application(
    values: ApplicationAutosave,
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
    kv: NamespacedClient = Depends(with_kv("autosave")),
):
    """
    Save an in-progress application
    """
    # Prevent auto-saving if already applied
    application = await db.get(Application, id)
    if not application:
        await kv.set(str(id), values.dict())


@router.get("/{id}", response_model=ApplicationRead, name="Read application")
async def read(
    id: str,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(
            Permission.Participant,
            Permission.Sponsor,
            Permission.Organizer,
        )
    ),
    db: AsyncSession = Depends(with_db),
):
    """
    Returns a single application by id
    """
    if Permission.Participant.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    application = await db.get(
        Application,
        id,
        options=[
            selectinload(Application.participant),
            selectinload(Application.school),
        ],
    )
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    elif Permission.Sponsor.matches(permission) and not application.share_information:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return clean_application_response(application, permission)


@router.get(
    "/{id}/resume", response_model=GetResumeResponse, name="Get application resume"
)
async def read_resume(
    id: str,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(
            Permission.Participant,
            Permission.Sponsor,
            Permission.Organizer,
        )
    ),
    s3: S3Client = Depends(with_s3),
    db: AsyncSession = Depends(with_db),
):
    """
    Returns a URL to access an application's resume by id
    """
    if Permission.Participant.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    elif Permission.Sponsor.matches(permission) and not application.share_information:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    elif application.resume is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    with tracer.start_as_current_span("generate-url"):
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": SETTINGS.registration.bucket, "Key": application.resume},
            ExpiresIn=15 * 60,
        )
        return {"url": url}


@router.patch("/{id}", status_code=HTTPStatus.NO_CONTENT, name="Update application")
async def update(
    id: str,
    info: ApplicationUpdate,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(Permission.Participant, Permission.Organizer)
    ),
    db: AsyncSession = Depends(with_db),
):
    """
    Updates the requester's application
    """
    if Permission.Participant.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    with tracer.start_as_current_span("update"):
        # Only update notes if organizer
        if Permission.Organizer.matches(permission) and info.notes is not None:
            application.notes = info.notes

        updated_fields = info.dict(exclude_unset=True, exclude={"notes"})
        for key, value in updated_fields.items():
            setattr(application, key, value)

    with tracer.start_as_current_span("validate"):
        *_, error = validate_model(Application, application.__dict__)
        if error:
            raise error

    db.add(application)
    await db.commit()


class SetStatusRequest(BaseModel):
    status: ApplicationStatus


@router.put(
    "/{id}/status",
    status_code=HTTPStatus.NO_CONTENT,
    name="Set application status",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def set_status(
    id: str,
    values: SetStatusRequest,
    db: AsyncSession = Depends(with_db),
):
    """
    Set the status for a participant's application
    """
    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Only allow setting status once
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail="status already finalized"
        )
    # Only allow setting to accepted or rejected
    elif values.status == ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="cannot finalize 'pending' status",
        )

    # Set the participant's status
    application.status = values.status
    await broadcast("registration", application.status.value, participant_id=id)

    db.add(application)
    await db.commit()


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT, name="Delete application")
async def delete(
    id: str,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(Permission.Participant, Permission.Director)
    ),
    db: AsyncSession = Depends(with_db),
) -> None:
    """
    Deletes an application by id
    """
    if Permission.Participant.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    application = await db.get(Application, id)
    if application:
        await db.delete(application)
        await db.commit()


def clean_application_response(
    application: Application, permission: str
) -> ApplicationRead:
    """
    Removes organizer-specific information from responses
    :param application: the raw application
    :param permission: the requester's permission
    :return: a response with sensitive information redacted
    """

    response = ApplicationRead.from_orm(application)

    if not Permission.Organizer.matches(permission):
        response.notes = None
        response.flagged = None

    return response
