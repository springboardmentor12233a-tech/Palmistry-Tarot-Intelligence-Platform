from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.palm import PalmAnalysisResult
from app.services.palm_analysis import palm_service

router = APIRouter(prefix="/palm", tags=["Palm Analysis"])


@router.post("/analyze", response_model=PalmAnalysisResult)
async def analyze_palm(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
):
    """
    Analyzes an uploaded hand photo or preset image URL:
    Runs UNet palm line segmentation, MediaPipe rectification, and biometric line classification.
    """
    image_bytes = None
    if file:
        try:
            image_bytes = await file.read()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read uploaded image file: {str(e)}",
            )

    result = palm_service.analyze_palm_image(
        image_bytes=image_bytes,
        image_url=image_url,
    )
    return result
