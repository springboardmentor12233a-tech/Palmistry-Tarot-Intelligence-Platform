import logging
from pathlib import Path

from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
)

from starlette.datastructures import (
    Headers,
)

from app.services.file_cleanup_service import (
    cleanup_old_palm_results,
)

from app.services.palm_service import (
    analyze_uploaded_palm,
)

from app.services.upload_security import (
    secure_palm_upload,
)


logger = logging.getLogger(
    __name__
)


router = APIRouter(
    prefix="/api/palm",
    tags=["Palm Analysis"],
)


# =========================================================
# DIRECTORY CONFIGURATION
# =========================================================

APP_DIRECTORY = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)


TEMP_UPLOAD_DIRECTORY = (
    APP_DIRECTORY
    / "data"
    / "palm_uploads"
)


PALM_RESULTS_DIRECTORY = (
    APP_DIRECTORY
    / "static"
    / "palm_results"
)


TEMP_UPLOAD_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True,
)


PALM_RESULTS_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# PALM ANALYSIS ENDPOINT
# =========================================================

@router.post(
    "/analyze",
)
async def analyze_palm_image(
    file: UploadFile = File(...),
):

    original_filename = (
        file.filename
        or "uploaded_palm"
    )

    secured_upload_path = None

    secured_file = None


    try:

        # -------------------------------------------------
        # STEP 1
        # Remove generated palm results that are older
        # than the configured retention period.
        # -------------------------------------------------

        try:

            cleanup_old_palm_results(
                PALM_RESULTS_DIRECTORY
            )

        except Exception:

            # Cleanup failure should not stop
            # a new palm analysis request.
            logger.exception(
                "Old palm result cleanup failed."
            )


        # -------------------------------------------------
        # STEP 2
        # Securely validate and temporarily save upload.
        #
        # This performs:
        # - extension validation
        # - MIME validation
        # - maximum size validation
        # - actual image validation
        # - image resolution validation
        # - safe UUID filename generation
        # -------------------------------------------------

        secured_upload = (
            await secure_palm_upload(
                upload=file,
                temporary_directory=(
                    TEMP_UPLOAD_DIRECTORY
                ),
            )
        )


        secured_upload_path = (
            secured_upload[
                "saved_path"
            ]
        )


        logger.info(
            (
                "Validated palm upload: "
                "format=%s, "
                "width=%s, "
                "height=%s, "
                "size=%s bytes"
            ),
            secured_upload[
                "detected_format"
            ],
            secured_upload[
                "width"
            ],
            secured_upload[
                "height"
            ],
            secured_upload[
                "file_size_bytes"
            ],
        )


        # -------------------------------------------------
        # STEP 3
        # Re-open the validated image.
        #
        # We create a new UploadFile so that the existing
        # analyze_uploaded_palm() service can continue
        # working exactly as before.
        # -------------------------------------------------

        secured_file_handle = (
            secured_upload_path.open(
                "rb"
            )
        )


        detected_format = (
            secured_upload[
                "detected_format"
            ]
        )


        if detected_format == "PNG":

            secure_content_type = (
                "image/png"
            )

        elif detected_format in {
            "HEIC",
            "HEIF",
        }:

            secure_content_type = (
                "image/heic"
            )

        else:

            secure_content_type = (
                "image/jpeg"
            )


        secured_file = UploadFile(
            file=secured_file_handle,

            filename=(
                secured_upload[
                    "safe_filename"
                ]
            ),

            headers=Headers(
                {
                    "content-type":
                        secure_content_type
                }
            ),
        )


        # -------------------------------------------------
        # STEP 4
        # Run existing palm model service.
        # -------------------------------------------------

        result = (
            await analyze_uploaded_palm(
                secured_file
            )
        )


        # -------------------------------------------------
        # STEP 5
        # Preserve original user filename in API response.
        #
        # Internally the model receives only a safe random
        # UUID-based filename.
        # -------------------------------------------------

        if isinstance(
            result,
            dict,
        ):

            result[
                "original_filename"
            ] = original_filename


        logger.info(
            (
                "Palm analysis completed "
                "successfully for %s"
            ),
            original_filename,
        )


        return result


    # =====================================================
    # KNOWN API / VALIDATION ERRORS
    # =====================================================

    except HTTPException:

        raise


    # =====================================================
    # UNEXPECTED ERRORS
    # =====================================================

    except Exception as error:

        logger.exception(
            (
                "Palm analysis failed "
                "for uploaded file: %s"
            ),
            original_filename,
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "The palm image could not "
                "be analyzed."
            ),
        ) from error


    # =====================================================
    # TEMPORARY FILE CLEANUP
    # =====================================================

    finally:

        # Close the new secured UploadFile
        # if it was created.

        if secured_file is not None:

            try:

                await secured_file.close()

            except Exception:

                logger.exception(
                    (
                        "Could not close "
                        "temporary palm file."
                    )
                )


        # Delete validated temporary upload.

        if (
            secured_upload_path
            is not None
        ):

            try:

                secured_upload_path.unlink(
                    missing_ok=True
                )

            except Exception:

                logger.exception(
                    (
                        "Could not delete "
                        "temporary palm upload: %s"
                    ),
                    secured_upload_path,
                )