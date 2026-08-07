import logging
import sys

from app.config import settings


def configure_logging():

    logging.basicConfig(
        level=getattr(
            logging,
            settings.LOG_LEVEL,
            logging.INFO,
        ),
        format=(
            "%(asctime)s | "
            "%(levelname)s | "
            "%(name)s | "
            "%(message)s"
        ),
        handlers=[
            logging.StreamHandler(
                sys.stdout
            )
        ],
        force=True,
    )

    logging.getLogger(
        "httpx"
    ).setLevel(
        logging.WARNING
    )

    logging.getLogger(
        "httpcore"
    ).setLevel(
        logging.WARNING
    )