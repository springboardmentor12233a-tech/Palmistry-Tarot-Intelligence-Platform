import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(
    BaseHTTPMiddleware
):
    """
    Middleware responsible for monitoring API requests.

    It records:
    - Request ID
    - HTTP method
    - API path
    - Response status
    - Processing duration
    - Client IP
    """

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        request_id = (
            request.headers.get(
                "X-Request-ID"
            )
            or uuid.uuid4().hex[:12]
        )

        request.state.request_id = request_id

        start_time = time.perf_counter()

        client_ip = "unknown"

        if request.client:
            client_ip = (
                request.client.host
            )

        logger.info(
            (
                "REQUEST START | "
                "id=%s | "
                "method=%s | "
                "path=%s | "
                "client=%s"
            ),
            request_id,
            request.method,
            request.url.path,
            client_ip,
        )

        try:

            response = await call_next(
                request
            )

        except Exception:

            duration_ms = (
                time.perf_counter()
                - start_time
            ) * 1000

            logger.exception(
                (
                    "REQUEST FAILED | "
                    "id=%s | "
                    "method=%s | "
                    "path=%s | "
                    "duration_ms=%.2f"
                ),
                request_id,
                request.method,
                request.url.path,
                duration_ms,
            )

            raise

        duration_ms = (
            time.perf_counter()
            - start_time
        ) * 1000

        response.headers[
            "X-Request-ID"
        ] = request_id

        response.headers[
            "X-Process-Time-MS"
        ] = f"{duration_ms:.2f}"

        if response.status_code >= 500:

            logger.error(
                (
                    "REQUEST COMPLETE | "
                    "id=%s | "
                    "method=%s | "
                    "path=%s | "
                    "status=%s | "
                    "duration_ms=%.2f"
                ),
                request_id,
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )

        elif response.status_code >= 400:

            logger.warning(
                (
                    "REQUEST COMPLETE | "
                    "id=%s | "
                    "method=%s | "
                    "path=%s | "
                    "status=%s | "
                    "duration_ms=%.2f"
                ),
                request_id,
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )

        else:

            logger.info(
                (
                    "REQUEST COMPLETE | "
                    "id=%s | "
                    "method=%s | "
                    "path=%s | "
                    "status=%s | "
                    "duration_ms=%.2f"
                ),
                request_id,
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )

        return response