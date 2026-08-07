import io

from fastapi.testclient import (
    TestClient,
)

from PIL import Image

from app.main import app


client = TestClient(
    app
)


# =========================================================
# HELPER
# =========================================================

def create_test_image(
    width=500,
    height=500,
    image_format="JPEG",
):

    image = Image.new(
        "RGB",
        (
            width,
            height,
        ),
        "white",
    )

    buffer = io.BytesIO()

    image.save(
        buffer,
        format=image_format,
    )

    buffer.seek(0)

    return buffer


# =========================================================
# NO FILE
# =========================================================

def test_palm_upload_without_file():

    response = client.post(
        "/api/palm/analyze"
    )

    assert (
        response.status_code
        == 422
    )


# =========================================================
# INVALID EXTENSION
# =========================================================

def test_reject_invalid_extension():

    fake_file = io.BytesIO(
        b"fake content"
    )

    response = client.post(
        "/api/palm/analyze",

        files={
            "file": (
                "malware.exe",
                fake_file,
                "application/octet-stream",
            )
        },
    )

    assert (
        response.status_code
        == 415
    )


# =========================================================
# INVALID MIME TYPE
# =========================================================

def test_reject_invalid_mime_type():

    image = create_test_image()

    response = client.post(
        "/api/palm/analyze",

        files={
            "file": (
                "palm.jpg",
                image,
                "application/octet-stream",
            )
        },
    )

    assert (
        response.status_code
        == 415
    )


# =========================================================
# MALFORMED IMAGE
# =========================================================

def test_reject_fake_jpg():

    fake_image = io.BytesIO(
        b"This is not actually a JPG image."
    )

    response = client.post(
        "/api/palm/analyze",

        files={
            "file": (
                "fake.jpg",
                fake_image,
                "image/jpeg",
            )
        },
    )

    assert (
        response.status_code
        == 400
    )


# =========================================================
# EXTENSION / CONTENT MISMATCH
# =========================================================

def test_reject_extension_mismatch():

    png_image = create_test_image(
        image_format="PNG"
    )

    response = client.post(
        "/api/palm/analyze",

        files={
            "file": (
                "fake.jpg",
                png_image,
                "image/jpeg",
            )
        },
    )

    assert (
        response.status_code
        == 400
    )


# =========================================================
# IMAGE TOO SMALL
# =========================================================

def test_reject_small_image():

    small_image = create_test_image(
        width=100,
        height=100,
    )

    response = client.post(
        "/api/palm/analyze",

        files={
            "file": (
                "small.jpg",
                small_image,
                "image/jpeg",
            )
        },
    )

    assert (
        response.status_code
        == 400
    )