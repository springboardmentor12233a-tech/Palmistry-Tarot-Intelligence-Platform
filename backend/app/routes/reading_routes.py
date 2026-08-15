import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    get_db,
)

from app.models.database_models import (
    User,
)

from app.models.reading_schemas import (
    CompleteReadingRequest,
    CompleteReadingResponse,
    ReadingSessionDetail,
    ReadingSessionSummary,
)

from app.services.analytics_service import (
    record_completed_reading,
)

from app.services.auth_service import (
    get_current_user,
)

from app.services.notification_service import (
    create_notification,
)

from app.services.reading_service import (
    generate_complete_reading,
)

from app.services.reading_session_service import (
    create_reading_session,
    get_reading_session_detail,
    get_user_reading_sessions,
)


logger = logging.getLogger(
    __name__
)


router = APIRouter(
    prefix="/api/readings",
    tags=["Complete Reading"],
)


# ============================================================
# DICTIONARY CONVERSION
# ============================================================

def convert_to_dict(
    value,
):
    """
    Convert Pydantic models or dictionaries
    into normal Python dictionaries.
    """

    if isinstance(
        value,
        dict,
    ):
        return value


    if hasattr(
        value,
        "model_dump",
    ):
        return value.model_dump()


    if hasattr(
        value,
        "dict",
    ):
        return value.dict()


    raise TypeError(
        "Unable to convert value to dictionary."
    )


# ============================================================
# GENERATE COMPLETE READING
# ============================================================

@router.post(
    "/generate-complete",
    response_model=(
        CompleteReadingResponse
    ),
)
def generate_complete_reading_endpoint(

    request: CompleteReadingRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Generate a complete reading.

    The completed reading is associated
    with the authenticated user and saved
    as a persistent reading session.
    """

    saved_reading_session_id = None


    # ========================================================
    # GENERATE AI READING
    # ========================================================

    try:

        reading, scores = (
            generate_complete_reading(
                request
            )
        )


        result = (
            CompleteReadingResponse(

                status="success",

                message=(
                    "Complete personalized "
                    "reading generated "
                    "successfully."
                ),

                reading=reading,

                scores=scores,

                reading_session_id=None,
            )
        )


    except HTTPException:

        raise


    except Exception as error:

        logger.exception(
            (
                "Complete reading "
                "generation failed."
            )
        )


        raise HTTPException(
            status_code=500,

            detail=(
                "The complete personalized "
                "reading could not be "
                "generated."
            ),

        ) from error


    # ========================================================
    # CONVERT TO DICTS
    # ========================================================

    request_data = (
        convert_to_dict(
            request
        )
    )


    response_data = (
        convert_to_dict(
            result
        )
    )


    # ========================================================
    # SAVE PERSISTENT READING SESSION
    # ========================================================

    try:

        reading_session = (
            create_reading_session(

                db=db,

                user_id=(
                    current_user.id
                ),

                request_data=(
                    request_data
                ),

                response_data=(
                    response_data
                ),
            )
        )


        saved_reading_session_id = (
            reading_session.id
        )


        result.reading_session_id = (
            reading_session.id
        )


        logger.info(
            (
                "Reading session %s "
                "created for user ID %s."
            ),
            reading_session.id,
            current_user.id,
        )


    except Exception:

        logger.exception(
            (
                "Failed to save persistent "
                "reading session for user "
                "ID %s."
            ),
            current_user.id,
        )


    # ========================================================
    # CREATE IN-APP NOTIFICATION
    # ========================================================

    if (
        saved_reading_session_id
        is not None
    ):

        try:

            create_notification(

                db=db,

                user_id=current_user.id,

                notification_type=(
                    "reading_ready"
                ),

                title=(
                    "Your new reading "
                    "is ready"
                ),

                message=(
                    "Your complete Palmistry "
                    "& Tarot reading has been "
                    "generated and saved. "
                    "You can review it from "
                    "your reading history."
                ),

                related_reading_session_id=(
                    saved_reading_session_id
                ),
            )


            logger.info(
                (
                    "Reading-ready notification "
                    "created for user ID %s "
                    "and reading session %s."
                ),
                current_user.id,
                saved_reading_session_id,
            )


        except Exception:

            logger.exception(
                (
                    "Failed to create "
                    "reading-ready notification "
                    "for user ID %s."
                ),
                current_user.id,
            )


    # ========================================================
    # SAVE USER ANALYTICS
    # ========================================================

    try:

        final_response_data = (
            convert_to_dict(
                result
            )
        )


        analytics_reading_id = (
            record_completed_reading(

                request_data=(
                    request_data
                ),

                response_data=(
                    final_response_data
                ),

                user_id=(
                    current_user.id
                ),
            )
        )


        logger.info(
            (
                "Analytics reading saved "
                "with ID %s for user "
                "ID %s."
            ),
            analytics_reading_id,
            current_user.id,
        )


    except Exception:

        logger.exception(
            (
                "Failed to save complete "
                "reading to analytics "
                "database."
            )
        )


    return result


# ============================================================
# MY READING SESSIONS
# ============================================================

@router.get(
    "/sessions",
    response_model=list[
        ReadingSessionSummary
    ],
)
def list_my_reading_sessions(

    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Return only reading sessions belonging
    to the authenticated user.
    """

    return get_user_reading_sessions(

        db=db,

        user_id=(
            current_user.id
        ),

        limit=limit,
    )


# ============================================================
# MY READING SESSION DETAIL
# ============================================================

@router.get(
    "/sessions/{session_id}",
    response_model=(
        ReadingSessionDetail
    ),
)
def get_my_reading_session(

    session_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Return one reading session only if it
    belongs to the authenticated user.
    """

    session = (
        get_reading_session_detail(

            db=db,

            user_id=(
                current_user.id
            ),

            session_id=(
                session_id
            ),
        )
    )


    if session is None:

        raise HTTPException(
            status_code=404,

            detail=(
                "Reading session "
                "not found."
            ),
        )


    return session