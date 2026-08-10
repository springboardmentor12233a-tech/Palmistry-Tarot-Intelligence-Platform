import logging
import sys

from app.config import settings


LOG_FORMAT = (
    "%(asctime)s | "
    "%(levelname)s | "
    "%(name)s | "
    "%(message)s"
)


def configure_logging() -> None:
    """
    Configure centralized application logging.

    Logs are written to stdout so they can be viewed in:
    - Local terminal
    - Docker logs
    - Render logs
    """

    log_level = getattr(
        logging,
        settings.LOG_LEVEL.upper(),
        logging.INFO,
    )

    root_logger = logging.getLogger()

    root_logger.setLevel(log_level)

    # Prevent duplicate handlers when FastAPI reloads.
    if root_logger.handlers:
        root_logger.handlers.clear()

    console_handler = logging.StreamHandler(
        sys.stdout
    )

    console_handler.setLevel(log_level)

    formatter = logging.Formatter(
        LOG_FORMAT
    )

    console_handler.setFormatter(
        formatter
    )

    root_logger.addHandler(
        console_handler
    )

    # Reduce noisy third-party logs.
    logging.getLogger(
        "multipart"
    ).setLevel(logging.WARNING)

    logging.getLogger(
        "PIL"
    ).setLevel(logging.WARNING)

    logging.getLogger(
        "urllib3"
    ).setLevel(logging.WARNING)

    logging.getLogger(
        "httpcore"
    ).setLevel(logging.WARNING)

    logging.getLogger(
        "httpx"
    ).setLevel(logging.WARNING)

    logging.getLogger(
        "uvicorn.access"
    ).setLevel(logging.INFO)

    logging.getLogger(
        __name__
    ).info(
        "Centralized logging configured. "
        "Environment=%s Level=%s",
        settings.APP_ENV,
        settings.LOG_LEVEL,
    )