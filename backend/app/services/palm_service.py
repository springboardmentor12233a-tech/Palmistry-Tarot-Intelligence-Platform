import json
import os
import shutil
import subprocess
import threading
import uuid
from pathlib import Path
from typing import Any

from fastapi import UploadFile


BACKEND_DIR = Path(__file__).resolve().parents[2]

PALM_CODE_DIR = (
    BACKEND_DIR
    / "external"
    / "palmistry"
    / "code"
)

PALM_INPUT_DIR = PALM_CODE_DIR / "input"
PALM_RESULTS_DIR = PALM_CODE_DIR / "results"

PALM_RUNNER_PATH = (
    PALM_CODE_DIR
    / "palm_json_runner.py"
)

DEFAULT_PALM_PYTHON = (
    r"A:\PalmistryPalmVenv\Scripts\python.exe"
)

PALM_PYTHON_EXECUTABLE = Path(
    os.getenv(
        "PALM_PYTHON_EXECUTABLE",
        DEFAULT_PALM_PYTHON,
    )
)

STATIC_RESULTS_ROOT = (
    BACKEND_DIR
    / "app"
    / "static"
    / "palm_results"
)

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".heic",
    ".heif",
}

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/heif",
    "application/octet-stream",
}


# The external model writes fixed filenames such as
# result.jpg and palm_lines.png.
#
# The lock prevents two requests from overwriting
# each other's model outputs.
PALM_MODEL_LOCK = threading.Lock()


class PalmServiceError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
    ) -> None:
        super().__init__(message)

        self.message = message
        self.status_code = status_code


def validate_environment() -> None:
    if not PALM_PYTHON_EXECUTABLE.exists():
        raise PalmServiceError(
            "The separate palm-model Python "
            "environment was not found at: "
            f"{PALM_PYTHON_EXECUTABLE}",
            status_code=500,
        )

    if not PALM_CODE_DIR.exists():
        raise PalmServiceError(
            "The external palm model directory "
            "was not found at: "
            f"{PALM_CODE_DIR}",
            status_code=500,
        )

    if not PALM_RUNNER_PATH.exists():
        raise PalmServiceError(
            "palm_json_runner.py was not found at: "
            f"{PALM_RUNNER_PATH}",
            status_code=500,
        )

    checkpoint_files = list(
        (PALM_CODE_DIR / "checkpoint").glob("*.pth")
    )

    if not checkpoint_files:
        raise PalmServiceError(
            "The palm-model checkpoint could "
            "not be found.",
            status_code=500,
        )


def validate_upload(
    upload: UploadFile,
    file_content: bytes,
) -> str:
    if not upload.filename:
        raise PalmServiceError(
            "The uploaded image does not have "
            "a filename.",
            status_code=400,
        )

    extension = Path(
        upload.filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise PalmServiceError(
            "Unsupported image format. Upload a "
            "JPG, JPEG, PNG, HEIC or HEIF image.",
            status_code=400,
        )

    if (
        upload.content_type
        and upload.content_type
        not in ALLOWED_CONTENT_TYPES
    ):
        raise PalmServiceError(
            "The uploaded file is not recognized "
            "as a supported image.",
            status_code=400,
        )

    if not file_content:
        raise PalmServiceError(
            "The uploaded image is empty.",
            status_code=400,
        )

    if len(file_content) > MAX_IMAGE_SIZE_BYTES:
        raise PalmServiceError(
            "The palm image is too large. The "
            "maximum supported size is 10 MB.",
            status_code=400,
        )

    return extension


def load_json_result(
    json_result_path: Path,
) -> dict[str, Any]:
    if not json_result_path.exists():
        raise PalmServiceError(
            "The palm model did not generate "
            "a JSON result.",
            status_code=500,
        )

    try:
        with json_result_path.open(
            "r",
            encoding="utf-8",
        ) as result_file:
            result = json.load(result_file)

    except json.JSONDecodeError as error:
        raise PalmServiceError(
            "The palm model generated invalid JSON.",
            status_code=500,
        ) from error

    if not isinstance(result, dict):
        raise PalmServiceError(
            "The palm model returned an invalid "
            "result structure.",
            status_code=500,
        )

    return result


def copy_output_file(
    source_filename: str,
    destination_directory: Path,
    destination_filename: str,
) -> str:
    source_path = (
        PALM_RESULTS_DIR / source_filename
    )

    if not source_path.exists():
        raise PalmServiceError(
            "The expected palm output file was "
            f"not generated: {source_filename}",
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


def clean_temporary_file(
    file_path: Path,
) -> None:
    try:
        if file_path.exists():
            file_path.unlink()

    except OSError:
        # Cleanup failure should not replace the
        # main analysis result or error.
        pass


async def analyze_uploaded_palm(
    upload: UploadFile,
) -> dict[str, Any]:
    validate_environment()

    file_content = await upload.read()

    extension = validate_upload(
        upload,
        file_content,
    )

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

    temporary_input_path.write_bytes(
        file_content
    )

    try:
        with PALM_MODEL_LOCK:
            command = [
                str(PALM_PYTHON_EXECUTABLE),
                str(PALM_RUNNER_PATH),
                "--input",
                temporary_input_filename,
                "--output-json",
                (
                    "results/"
                    f"{json_result_filename}"
                ),
            ]

            try:
                completed_process = subprocess.run(
                    command,
                    cwd=str(PALM_CODE_DIR),
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=180,
                    check=False,
                )

            except subprocess.TimeoutExpired as error:
                raise PalmServiceError(
                    "Palm analysis exceeded the "
                    "three-minute processing limit.",
                    status_code=504,
                ) from error

            model_result = load_json_result(
                json_result_path
            )

            if (
                completed_process.returncode != 0
                or model_result.get("status")
                != "success"
            ):
                model_message = model_result.get(
                    "message"
                )

                stderr_message = (
                    completed_process.stderr.strip()
                )

                error_message = (
                    model_message
                    or stderr_message
                    or "Palm analysis failed."
                )

                raise PalmServiceError(
                    error_message,
                    status_code=422,
                )

            palm_analysis = model_result.get(
                "palm_analysis"
            )

            descriptions = model_result.get(
                "descriptions"
            )

            if not isinstance(
                palm_analysis,
                dict,
            ):
                raise PalmServiceError(
                    "The palm model did not return "
                    "structured line results.",
                    status_code=500,
                )

            if not isinstance(
                descriptions,
                dict,
            ):
                raise PalmServiceError(
                    "The palm model did not return "
                    "line descriptions.",
                    status_code=500,
                )

            copy_output_file(
                source_filename="result.jpg",
                destination_directory=(
                    request_static_directory
                ),
                destination_filename=(
                    "result.jpg"
                ),
            )

            copy_output_file(
                source_filename="warped_palm.jpg",
                destination_directory=(
                    request_static_directory
                ),
                destination_filename=(
                    "warped_palm.jpg"
                ),
            )

            copy_output_file(
                source_filename="palm_lines.png",
                destination_directory=(
                    request_static_directory
                ),
                destination_filename=(
                    "palm_lines.png"
                ),
            )

        static_base_url = (
            "/static/palm_results/"
            f"{request_id}"
        )

        return {
            "status": "success",
            "message": (
                "Palm image analyzed successfully."
            ),
            "request_id": request_id,
            "original_filename": upload.filename,
            "palm_analysis": {
                "heart_line": palm_analysis.get(
                    "heart_line"
                ),
                "head_line": palm_analysis.get(
                    "head_line"
                ),
                "life_line": palm_analysis.get(
                    "life_line"
                ),
            },
            "descriptions": {
                "heart_line": descriptions.get(
                    "heart_line",
                    "",
                ),
                "head_line": descriptions.get(
                    "head_line",
                    "",
                ),
                "life_line": descriptions.get(
                    "life_line",
                    "",
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

    finally:
        clean_temporary_file(
            temporary_input_path
        )

        clean_temporary_file(
            json_result_path
        )

        await upload.close()