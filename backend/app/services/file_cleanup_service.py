import logging
import shutil
import time
from pathlib import Path

from app.config import settings


logger = logging.getLogger(
    __name__
)


def cleanup_old_palm_results(
    results_directory: Path,
) -> int:

    if (
        not results_directory.exists()
    ):
        return 0


    retention_seconds = (
        settings
        .PALM_RESULT_RETENTION_HOURS
        * 60
        * 60
    )

    cutoff_time = (
        time.time()
        - retention_seconds
    )

    deleted_count = 0


    for item in (
        results_directory.iterdir()
    ):

        try:
            modified_time = (
                item.stat().st_mtime
            )

            if (
                modified_time
                >= cutoff_time
            ):
                continue


            if item.is_dir():

                shutil.rmtree(
                    item,
                    ignore_errors=True,
                )

            else:

                item.unlink(
                    missing_ok=True
                )


            deleted_count += 1


        except Exception:

            logger.exception(
                (
                    "Could not remove old "
                    "palm result: %s"
                ),
                item,
            )


    if deleted_count > 0:

        logger.info(
            (
                "Removed %s old palm "
                "result item(s)."
            ),
            deleted_count,
        )


    return deleted_count