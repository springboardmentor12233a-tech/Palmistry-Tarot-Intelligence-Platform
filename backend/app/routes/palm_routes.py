from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.models.palm_schemas import (
    PalmAnalysisResponse,
)
from app.services.palm_service import (
    PalmServiceError,
    analyze_uploaded_palm,
)


router = APIRouter(
    prefix="/api/palm",
    tags=["Palm Analysis"],
)


@router.post(
    "/analyze",
    response_model=PalmAnalysisResponse,
)
async def analyze_palm_image(
    file: UploadFile = File(...),
) -> PalmAnalysisResponse:
    try:
        result = await analyze_uploaded_palm(
            file
        )

        return PalmAnalysisResponse(
            **result
        )

    except PalmServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred "
                "during palm analysis."
            ),
        ) from error