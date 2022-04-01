from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.responses import UJSONResponse
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import applications, legal_agreements, schools

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, redoc_url="/docs")

app.include_router(applications.router, prefix="/applications")
app.include_router(legal_agreements.router, prefix="/legal-agreements")
app.include_router(schools.router, prefix="/schools")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(_request: Request, exception: ValidationError):
    # Modfiy the errors to show it occurred in the request body
    errors = exception.errors()
    for i, error in enumerate(errors):
        location = list(error["loc"])
        location.insert(0, "body")
        errors[i]["loc"] = tuple(location)

    return UJSONResponse(
        {"detail": errors}, status_code=HTTPStatus.UNPROCESSABLE_ENTITY
    )
