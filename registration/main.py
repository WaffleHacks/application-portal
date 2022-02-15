from fastapi import FastAPI, Request
from fastapi.responses import UJSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import applications
from . import legal_agreements

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, redoc_url="/docs")

app.include_router(applications.router, prefix="/applications")
app.include_router(legal_agreements.router, prefix="/legal-agreements")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )
