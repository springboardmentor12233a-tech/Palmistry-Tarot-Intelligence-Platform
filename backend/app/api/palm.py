from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.palm.palm_engine import palm_engine_service

router = APIRouter()

@router.post("/analyze")
async def analyze_palm(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    try:
        contents = await file.read()
        result = palm_engine_service.process_image(contents)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred processing the image: {str(e)}")
