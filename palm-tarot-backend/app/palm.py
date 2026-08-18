from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.palm_service import analyze_palm


router = APIRouter(
    prefix="/api/palm",
    tags=["Palm Analysis"]
)


BASE_DIR = Path(__file__).resolve().parents[1]

RESULTS_DIR = (
    BASE_DIR
    / "palmistry"
    / "code"
    / "results"
)


@router.post("/analyze")
async def palm_analyze(
    file: UploadFile = File(...)
):

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
    }

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please upload a JPG, PNG, "
                "WEBP, or HEIC image."
            ),
        )

    try:

        result = await analyze_palm(file)

        return result

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Palm analysis failed: {str(exc)}",
        )


# ---------------------------------------------------------
# Clean palm image
# ---------------------------------------------------------

@router.get("/image")
async def palm_image():

    path = (
        RESULTS_DIR
        / "warped_palm_clean.jpg"
    )

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail="Palm image not available."
        )

    return FileResponse(
        path,
        media_type="image/jpeg"
    )


# ---------------------------------------------------------
# Palm line visualization
# ---------------------------------------------------------

@router.get("/lines")
async def palm_lines():

    path = (
        RESULTS_DIR
        / "palm_lines.png"
    )

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail="Palm line image not available."
        )

    return FileResponse(
        path,
        media_type="image/png"
    )


# ---------------------------------------------------------
# Legacy repository result
# ---------------------------------------------------------

@router.get("/result")
async def palm_result():

    path = (
        RESULTS_DIR
        / "result.jpg"
    )

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail="Palm result not available."
        )

    return FileResponse(
        path,
        media_type="image/jpeg"
    )