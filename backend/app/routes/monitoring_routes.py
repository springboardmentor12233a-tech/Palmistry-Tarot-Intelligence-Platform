import time
from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import settings


router = APIRouter(
    prefix="/api/monitoring",
    tags=["Monitoring"],
)


APPLICATION_START_TIME = (
    time.time()
)


@router.get("/status")
async def monitoring_status():
    """
    Production monitoring endpoint.

    Returns basic application status without
    exposing sensitive configuration.
    """

    current_time = time.time()

    uptime_seconds = int(
        current_time
        - APPLICATION_START_TIME
    )

    return {
        "status": "healthy",

        "application": (
            settings.APP_NAME
        ),

        "version": (
            settings.APP_VERSION
        ),

        "environment": (
            settings.APP_ENV
        ),

        "timestamp": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),

        "uptime_seconds": (
            uptime_seconds
        ),

        "logging": {
            "enabled": True,
            "level": settings.LOG_LEVEL,
        },

        "monitoring": {
            "request_logging": True,
            "request_id_tracking": True,
            "response_time_tracking": True,
            "error_logging": True,
        },
    }