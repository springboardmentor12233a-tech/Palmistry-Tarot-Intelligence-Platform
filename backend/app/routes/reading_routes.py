import logging

from fastapi import APIRouter, HTTPException

from app.models.reading_schemas import (
    CompleteReadingRequest,
    CompleteReadingResponse,
)

from app.services.analytics_service import (
    record_completed_reading,
)

from app.services.reading_service import (
    generate_complete_reading,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/readings",
    tags=["Complete Reading"],
)


def convert_to_dict(value):
    """
    Convert Pydantic models or dictionaries
    into normal Python dictionaries.
    """

    if isinstance(value, dict):
        return value

    if hasattr(value, "model_dump"):
        return value.model_dump()

    if hasattr(value, "dict"):
        return value.dict()

    raise TypeError(
        "Unable to convert value to dictionary."
    )


@router.post(
    "/generate-complete",
    response_model=CompleteReadingResponse,
)
def generate_complete_reading_endpoint(
    request: CompleteReadingRequest,
):
    """
    Generate a complete reading and save
    analytics after successful generation.
    """

    try:
        # IMPORTANT:
        # reading_service returns a tuple:
        # (reading, scores)
        reading, scores = generate_complete_reading(
            request
        )

        result = CompleteReadingResponse(
            status="success",
            message=(
                "Complete personalized reading "
                "generated successfully."
            ),
            reading=reading,
            scores=scores,
        )

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Complete reading generation failed."
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The complete personalized reading "
                "could not be generated."
            ),
        ) from error


    # -----------------------------------------
    # SAVE ANALYTICS
    # -----------------------------------------

    try:
        request_data = convert_to_dict(
            request
        )

        response_data = convert_to_dict(
            result
        )

        analytics_reading_id = (
            record_completed_reading(
                request_data=request_data,
                response_data=response_data,
            )
        )

        logger.info(
            "Analytics reading saved successfully "
            "with ID %s",
            analytics_reading_id,
        )

    except Exception:
        # Analytics errors must not stop the
        # user from receiving the reading.
        logger.exception(
            "Failed to save complete reading "
            "to analytics database."
        )


    return result