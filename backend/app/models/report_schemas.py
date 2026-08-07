from pydantic import BaseModel

from app.models.reading_schemas import (
    CompleteReadingRequest,
    CompleteReadingResponse,
)


class ReadingPdfRequest(BaseModel):
    reading_request: CompleteReadingRequest
    reading_response: CompleteReadingResponse