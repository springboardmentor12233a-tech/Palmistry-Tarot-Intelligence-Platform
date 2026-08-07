import logging

from fastapi import (
    HTTPException,
    Request,
)

from fastapi.exceptions import (
    RequestValidationError,
)

from fastapi.responses import (
    JSONResponse,
)


logger = logging.getLogger(
    __name__
)


async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):

    logger.warning(
        "HTTP error %s on %s %s",
        exc.status_code,
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):

    logger.warning(
        "Validation error on %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=422,
        content={
            "status":
                "validation_error",

            "message":
                "The submitted request contains invalid or missing data.",

            "errors":
                exc.errors(),
        },
    )


async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
):

    logger.exception(
        "Unexpected server error on %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "status":
                "error",

            "message":
                (
                    "An unexpected server error occurred. "
                    "Please try again later."
                ),
        },
    )