import uuid
from pathlib import Path
from typing import Tuple

from fastapi import (
    HTTPException,
    UploadFile,
)

from PIL import (
    Image,
    UnidentifiedImageError,
)

from pillow_heif import (
    register_heif_opener,
)

from app.config import settings


# Enable HEIC / HEIF support in Pillow.
register_heif_opener()


# Protect against extremely large
# decompressed images.
Image.MAX_IMAGE_PIXELS = (
    settings.MAX_IMAGE_WIDTH
    * settings.MAX_IMAGE_HEIGHT
)


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".heic",
    ".heif",
}


ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
}


ALLOWED_IMAGE_FORMATS = {
    "JPEG",
    "PNG",
    "HEIC",
    "HEIF",
}


FORMAT_EXTENSION_MAP = {
    "JPEG": {
        ".jpg",
        ".jpeg",
    },

    "PNG": {
        ".png",
    },

    "HEIC": {
        ".heic",
        ".heif",
    },

    "HEIF": {
        ".heic",
        ".heif",
    },
}


def get_safe_extension(
    filename: str,
) -> str:

    if not filename:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded image does "
                "not have a filename."
            ),
        )

    extension = Path(
        filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported image extension. "
                "Allowed formats are JPG, JPEG, "
                "PNG, HEIC and HEIF."
            ),
        )

    return extension


def validate_mime_type(
    upload: UploadFile,
) -> None:

    content_type = (
        upload.content_type or ""
    ).lower()

    if (
        content_type
        not in ALLOWED_MIME_TYPES
    ):
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported image MIME type. "
                "Please upload a valid JPG, "
                "PNG, HEIC or HEIF image."
            ),
        )


def create_safe_filename(
    extension: str,
) -> str:

    unique_id = uuid.uuid4().hex

    return (
        f"palm_{unique_id}"
        f"{extension}"
    )


async def save_upload_with_size_limit(
    upload: UploadFile,
    destination: Path,
) -> int:

    max_bytes = (
        settings.MAX_UPLOAD_MB
        * 1024
        * 1024
    )

    total_size = 0

    chunk_size = (
        1024 * 1024
    )

    destination.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    try:
        with destination.open(
            "wb"
        ) as output_file:

            while True:

                chunk = await upload.read(
                    chunk_size
                )

                if not chunk:
                    break

                total_size += len(
                    chunk
                )

                if total_size > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Palm image is too large. "
                            f"Maximum allowed size is "
                            f"{settings.MAX_UPLOAD_MB} MB."
                        ),
                    )

                output_file.write(
                    chunk
                )

    except Exception:
        if destination.exists():
            destination.unlink(
                missing_ok=True
            )

        raise

    finally:
        await upload.close()

    if total_size == 0:
        destination.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded image is empty."
            ),
        )

    return total_size


def validate_actual_image(
    image_path: Path,
    expected_extension: str,
) -> Tuple[int, int, str]:

    try:
        # First validation pass.
        with Image.open(
            image_path
        ) as image:

            detected_format = (
                image.format or ""
            ).upper()

            image.verify()

        # Re-open after verify.
        with Image.open(
            image_path
        ) as image:

            width, height = (
                image.size
            )

            image.load()

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded file is not "
                "a valid readable image."
            ),
        ) from error


    if (
        detected_format
        not in ALLOWED_IMAGE_FORMATS
    ):
        raise HTTPException(
            status_code=415,
            detail=(
                "The actual image format "
                "is not supported."
            ),
        )


    valid_extensions = (
        FORMAT_EXTENSION_MAP.get(
            detected_format,
            set(),
        )
    )

    if (
        expected_extension
        not in valid_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "The file extension does not "
                "match the actual image format."
            ),
        )


    if (
        width
        < settings.MIN_IMAGE_WIDTH
        or
        height
        < settings.MIN_IMAGE_HEIGHT
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Palm image resolution is too "
                "small. Minimum resolution is "
                f"{settings.MIN_IMAGE_WIDTH} x "
                f"{settings.MIN_IMAGE_HEIGHT}."
            ),
        )


    if (
        width
        > settings.MAX_IMAGE_WIDTH
        or
        height
        > settings.MAX_IMAGE_HEIGHT
    ):
        raise HTTPException(
            status_code=413,
            detail=(
                "Palm image resolution is too "
                "large. Maximum resolution is "
                f"{settings.MAX_IMAGE_WIDTH} x "
                f"{settings.MAX_IMAGE_HEIGHT}."
            ),
        )


    return (
        width,
        height,
        detected_format,
    )


async def secure_palm_upload(
    upload: UploadFile,
    temporary_directory: Path,
) -> dict:

    extension = (
        get_safe_extension(
            upload.filename
        )
    )

    validate_mime_type(
        upload
    )

    safe_filename = (
        create_safe_filename(
            extension
        )
    )

    saved_path = (
        temporary_directory
        / safe_filename
    )

    file_size = (
        await save_upload_with_size_limit(
            upload,
            saved_path,
        )
    )

    try:
        (
            width,
            height,
            detected_format,
        ) = validate_actual_image(
            saved_path,
            extension,
        )

    except Exception:
        saved_path.unlink(
            missing_ok=True
        )

        raise


    return {
        "safe_filename":
            safe_filename,

        "saved_path":
            saved_path,

        "file_size_bytes":
            file_size,

        "width":
            width,

        "height":
            height,

        "detected_format":
            detected_format,
    }