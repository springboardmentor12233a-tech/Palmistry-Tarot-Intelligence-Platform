import json
import logging
import shutil
import subprocess
import threading
import uuid
from pathlib import Path
from typing import Any

from fastapi import UploadFile

from app.config import settings


logger = logging.getLogger(__name__)


# ============================================================
# PATH CONFIGURATION
# ============================================================

# Local:
# A:\Palmistry_Tarot_Intelligence\backend
#
# Docker / Render:
# /app
BACKEND_DIR = Path(__file__).resolve().parents[2]


# External palmistry repository root
#
# Local:
# backend/external/palmistry
#
# Docker:
# /app/external/palmistry
PALMISTRY_ROOT = (
    BACKEND_DIR
    / "external"
    / "palmistry"
)


# Palmistry code directory
#
# Local:
# backend/external/palmistry/code
#
# Docker:
# /app/external/palmistry/code
PALM_CODE_DIR = (
    PALMISTRY_ROOT
    / "code"
)


# Input/output folders used by external model
PALM_INPUT_DIR = (
    PALM_CODE_DIR
    / "input"
)

PALM_RESULTS_DIR = (
    PALM_CODE_DIR
    / "results"
)


# Wrapper used by FastAPI to run the external model
PALM_RUNNER_PATH = (
    PALM_CODE_DIR
    / "palm_json_runner.py"
)


# IMPORTANT:
# The checkpoint is NOT inside code/checkpoint.
#
# Correct location:
# external/palmistry/detect/checkpoints/
PALM_CHECKPOINT_PATH = (
    PALMISTRY_ROOT
    / "detect"
    / "checkpoints"
    / "checkpoint_aug_epoch70.pth"
)


# Separate Python environment used for palm model
#
# Local:
# A:\PalmistryPalmVenv\Scripts\python.exe
#
# Docker / Render:
# /opt/palm-venv/bin/python
PALM_PYTHON_EXECUTABLE = Path(
    settings.PALM_PYTHON_EXECUTABLE
)


# FastAPI static output directory
STATIC_RESULTS_ROOT = (
    BACKEND_DIR
    / "app"
    / "static"
    / "palm_results"
)


# ============================================================
# UPLOAD SETTINGS
# ============================================================

MAX_IMAGE_SIZE_BYTES = (
    settings.MAX_UPLOAD_MB
    * 1024
    * 1024
)


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".jfif",
    ".png",
    ".webp",
    ".heic",
    ".heif",
}


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
    "application/octet-stream",
}


# ============================================================
# MODEL LOCK
# ============================================================

# The external model writes fixed filenames such as:
#
# result.jpg
# warped_palm.jpg
# palm_lines.png
#
# Therefore two simultaneous model executions could overwrite
# each other's files.
PALM_MODEL_LOCK = threading.Lock()


# ============================================================
# SERVICE EXCEPTION
# ============================================================

class PalmServiceError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
    ) -> None:
        super().__init__(message)

        self.message = message
        self.status_code = status_code


# ============================================================
# ENVIRONMENT VALIDATION
# ============================================================

def validate_environment() -> None:
    """
    Verify that everything required by the external palm model
    exists before starting the subprocess.
    """

    logger.info(
        "Palm Python executable: %s",
        PALM_PYTHON_EXECUTABLE,
    )

    logger.info(
        "Palmistry root: %s",
        PALMISTRY_ROOT,
    )

    logger.info(
        "Palm code directory: %s",
        PALM_CODE_DIR,
    )

    logger.info(
        "Palm runner: %s",
        PALM_RUNNER_PATH,
    )

    logger.info(
        "Palm checkpoint: %s",
        PALM_CHECKPOINT_PATH,
    )


    # --------------------------------------------------------
    # Python interpreter
    # --------------------------------------------------------

    if not PALM_PYTHON_EXECUTABLE.exists():
        raise PalmServiceError(
            (
                "The separate palm-model Python "
                "environment was not found at: "
                f"{PALM_PYTHON_EXECUTABLE}"
            ),
            status_code=500,
        )


    # --------------------------------------------------------
    # External repository
    # --------------------------------------------------------

    if not PALMISTRY_ROOT.exists():
        raise PalmServiceError(
            (
                "The external palmistry repository "
                "was not found at: "
                f"{PALMISTRY_ROOT}"
            ),
            status_code=500,
        )


    # --------------------------------------------------------
    # Code directory
    # --------------------------------------------------------

    if not PALM_CODE_DIR.exists():
        raise PalmServiceError(
            (
                "The external palm model directory "
                "was not found at: "
                f"{PALM_CODE_DIR}"
            ),
            status_code=500,
        )


    # --------------------------------------------------------
    # Runner
    # --------------------------------------------------------

    if not PALM_RUNNER_PATH.exists():
        raise PalmServiceError(
            (
                "palm_json_runner.py was not found at: "
                f"{PALM_RUNNER_PATH}"
            ),
            status_code=500,
        )


    # --------------------------------------------------------
    # Model checkpoint
    # --------------------------------------------------------

    if not PALM_CHECKPOINT_PATH.exists():
        raise PalmServiceError(
            (
                "The palm-model checkpoint could not "
                "be found at: "
                f"{PALM_CHECKPOINT_PATH}"
            ),
            status_code=500,
        )


    # --------------------------------------------------------
    # Required directories
    # --------------------------------------------------------

    PALM_INPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    PALM_RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    STATIC_RESULTS_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )


# ============================================================
# UPLOAD VALIDATION
# ============================================================

def validate_upload(
    upload: UploadFile,
    file_content: bytes,
) -> str:
    """
    Basic validation performed before sending the image to the
    external model.

    More detailed image validation is already handled by the
    secure-upload service.
    """

    if not upload.filename:
        raise PalmServiceError(
            "The uploaded image does not have a filename.",
            status_code=400,
        )


    extension = Path(
        upload.filename
    ).suffix.lower()


    if extension not in ALLOWED_EXTENSIONS:
        raise PalmServiceError(
            (
                "Unsupported image format. Upload a "
                "JPG, JPEG, JFIF, PNG, WEBP, HEIC "
                "or HEIF image."
            ),
            status_code=415,
        )


    if (
        upload.content_type
        and upload.content_type
        not in ALLOWED_CONTENT_TYPES
    ):
        raise PalmServiceError(
            (
                "The uploaded file is not recognized "
                "as a supported image."
            ),
            status_code=415,
        )


    if not file_content:
        raise PalmServiceError(
            "The uploaded image is empty.",
            status_code=400,
        )


    if (
        len(file_content)
        > MAX_IMAGE_SIZE_BYTES
    ):
        raise PalmServiceError(
            (
                "The palm image is too large. "
                f"The maximum supported size is "
                f"{settings.MAX_UPLOAD_MB} MB."
            ),
            status_code=413,
        )


    return extension


# ============================================================
# JSON RESULT LOADING
# ============================================================

def load_json_result(
    json_result_path: Path,
) -> dict[str, Any]:
    """
    Load the structured JSON generated by palm_json_runner.py.
    """

    if not json_result_path.exists():
        raise PalmServiceError(
            (
                "The palm model did not generate "
                "a JSON result."
            ),
            status_code=500,
        )


    try:
        with json_result_path.open(
            "r",
            encoding="utf-8",
        ) as result_file:

            result = json.load(
                result_file
            )

    except json.JSONDecodeError as error:
        raise PalmServiceError(
            "The palm model generated invalid JSON.",
            status_code=500,
        ) from error


    if not isinstance(
        result,
        dict,
    ):
        raise PalmServiceError(
            (
                "The palm model returned an invalid "
                "result structure."
            ),
            status_code=500,
        )


    return result


# ============================================================
# OUTPUT FILE COPY
# ============================================================

def copy_output_file(
    source_filename: str,
    destination_directory: Path,
    destination_filename: str,
) -> str:
    """
    Copy a generated external-model result into FastAPI's
    static result directory.
    """

    source_path = (
        PALM_RESULTS_DIR
        / source_filename
    )


    if not source_path.exists():
        raise PalmServiceError(
            (
                "The expected palm output file was "
                f"not generated: {source_filename}"
            ),
            status_code=500,
        )


    destination_path = (
        destination_directory
        / destination_filename
    )


    shutil.copy2(
        source_path,
        destination_path,
    )


    return destination_filename


# ============================================================
# TEMPORARY FILE CLEANUP
# ============================================================

def clean_temporary_file(
    file_path: Path,
) -> None:
    """
    Delete temporary files without replacing the primary
    request result if cleanup itself fails.
    """

    try:
        if file_path.exists():
            file_path.unlink()

    except OSError as error:
        logger.warning(
            "Could not remove temporary palm file %s: %s",
            file_path,
            error,
        )


# ============================================================
# PALM ANALYSIS
# ============================================================

async def analyze_uploaded_palm(
    upload: UploadFile,
) -> dict[str, Any]:
    """
    Run the external palmistry model using its isolated Python
    environment and return structured API output.
    """

    # --------------------------------------------------------
    # Validate model environment
    # --------------------------------------------------------

    validate_environment()


    # --------------------------------------------------------
    # Read uploaded image
    # --------------------------------------------------------

    file_content = await upload.read()


    extension = validate_upload(
        upload,
        file_content,
    )


    # --------------------------------------------------------
    # Unique request ID
    # --------------------------------------------------------

    request_id = uuid.uuid4().hex


    temporary_input_filename = (
        f"api_{request_id}{extension}"
    )


    json_result_filename = (
        f"api_{request_id}.json"
    )


    temporary_input_path = (
        PALM_INPUT_DIR
        / temporary_input_filename
    )


    json_result_path = (
        PALM_RESULTS_DIR
        / json_result_filename
    )


    request_static_directory = (
        STATIC_RESULTS_ROOT
        / request_id
    )


    # --------------------------------------------------------
    # Ensure directories exist
    # --------------------------------------------------------

    PALM_INPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


    PALM_RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


    request_static_directory.mkdir(
        parents=True,
        exist_ok=True,
    )


    # --------------------------------------------------------
    # Write upload into external model input directory
    # --------------------------------------------------------

    temporary_input_path.write_bytes(
        file_content
    )


    logger.info(
        "Palm request %s saved input to %s",
        request_id,
        temporary_input_path,
    )


    try:

        # ====================================================
        # EXTERNAL MODEL EXECUTION
        # ====================================================

        with PALM_MODEL_LOCK:

            command = [
                str(
                    PALM_PYTHON_EXECUTABLE
                ),
                str(
                    PALM_RUNNER_PATH
                ),
                "--input",
                temporary_input_filename,
                "--output-json",
                (
                    "results/"
                    f"{json_result_filename}"
                ),
            ]


            logger.info(
                "Starting palm-model subprocess for request %s",
                request_id,
            )


            logger.info(
                "Palm-model working directory: %s",
                PALM_CODE_DIR,
            )


            # ------------------------------------------------
            # Run palm model
            # ------------------------------------------------

            try:
                completed_process = subprocess.run(
                    command,
                    cwd=str(
                        PALM_CODE_DIR
                    ),
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=180,
                    check=False,
                )

            except subprocess.TimeoutExpired as error:
                raise PalmServiceError(
                    (
                        "Palm analysis exceeded the "
                        "three-minute processing limit."
                    ),
                    status_code=504,
                ) from error


            # ------------------------------------------------
            # Log subprocess result
            # ------------------------------------------------

            stdout_message = (
                completed_process.stdout.strip()
            )

            stderr_message = (
                completed_process.stderr.strip()
            )


            logger.info(
                (
                    "Palm subprocess completed for request "
                    "%s with return code %s"
                ),
                request_id,
                completed_process.returncode,
            )


            if stdout_message:
                logger.info(
                    "Palm subprocess stdout: %s",
                    stdout_message,
                )


            if stderr_message:
                logger.warning(
                    "Palm subprocess stderr: %s",
                    stderr_message,
                )


            # ------------------------------------------------
            # Handle subprocess failure with no JSON
            # ------------------------------------------------

            if (
                completed_process.returncode != 0
                and not json_result_path.exists()
            ):
                raise PalmServiceError(
                    (
                        stderr_message
                        or stdout_message
                        or (
                            "Palm analysis failed before "
                            "a result could be generated."
                        )
                    ),
                    status_code=422,
                )


            # ------------------------------------------------
            # Load JSON produced by runner
            # ------------------------------------------------

            model_result = load_json_result(
                json_result_path
            )


            # ------------------------------------------------
            # Validate runner result
            # ------------------------------------------------

            if (
                completed_process.returncode != 0
                or model_result.get("status")
                != "success"
            ):

                model_message = (
                    model_result.get(
                        "message"
                    )
                )


                error_message = (
                    model_message
                    or stderr_message
                    or stdout_message
                    or "Palm analysis failed."
                )


                raise PalmServiceError(
                    error_message,
                    status_code=422,
                )


            # ------------------------------------------------
            # Extract structured result
            # ------------------------------------------------

            palm_analysis = (
                model_result.get(
                    "palm_analysis"
                )
            )


            descriptions = (
                model_result.get(
                    "descriptions"
                )
            )


            if not isinstance(
                palm_analysis,
                dict,
            ):
                raise PalmServiceError(
                    (
                        "The palm model did not return "
                        "structured line results."
                    ),
                    status_code=500,
                )


            if not isinstance(
                descriptions,
                dict,
            ):
                raise PalmServiceError(
                    (
                        "The palm model did not return "
                        "line descriptions."
                    ),
                    status_code=500,
                )


            # ------------------------------------------------
            # Required output files
            # ------------------------------------------------

            copy_output_file(
                source_filename=(
                    "result.jpg"
                ),
                destination_directory=(
                    request_static_directory
                ),
                destination_filename=(
                    "result.jpg"
                ),
            )


            copy_output_file(
                source_filename=(
                    "warped_palm.jpg"
                ),
                destination_directory=(
                    request_static_directory
                ),
                destination_filename=(
                    "warped_palm.jpg"
                ),
            )


            copy_output_file(
                source_filename=(
                    "palm_lines.png"
                ),
                destination_directory=(
                    request_static_directory
                ),
                destination_filename=(
                    "palm_lines.png"
                ),
            )


        # ====================================================
        # BUILD API RESPONSE
        # ====================================================

        static_base_url = (
            "/static/palm_results/"
            f"{request_id}"
        )


        response = {
            "status": "success",

            "message": (
                "Palm image analyzed successfully."
            ),

            "request_id": request_id,

            "original_filename": (
                upload.filename
            ),

            "palm_analysis": {
                "heart_line": (
                    palm_analysis.get(
                        "heart_line"
                    )
                ),

                "head_line": (
                    palm_analysis.get(
                        "head_line"
                    )
                ),

                "life_line": (
                    palm_analysis.get(
                        "life_line"
                    )
                ),
            },

            "descriptions": {
                "heart_line": (
                    descriptions.get(
                        "heart_line",
                        "",
                    )
                ),

                "head_line": (
                    descriptions.get(
                        "head_line",
                        "",
                    )
                ),

                "life_line": (
                    descriptions.get(
                        "life_line",
                        "",
                    )
                ),
            },

            "output_files": {
                "result_image_url": (
                    f"{static_base_url}/result.jpg"
                ),

                "warped_palm_url": (
                    f"{static_base_url}/"
                    "warped_palm.jpg"
                ),

                "palm_lines_url": (
                    f"{static_base_url}/"
                    "palm_lines.png"
                ),
            },
        }


        logger.info(
            "Palm analysis completed successfully for request %s",
            request_id,
        )


        return response


    # ========================================================
    # CLEANUP
    # ========================================================

    finally:

        clean_temporary_file(
            temporary_input_path
        )


        clean_temporary_file(
            json_result_path
        )


        await upload.close()