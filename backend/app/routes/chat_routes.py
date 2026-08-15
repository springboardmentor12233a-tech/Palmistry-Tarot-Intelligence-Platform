import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from google.genai import errors

from sqlalchemy.orm import Session

from app.core.database import (
    get_db,
)

from app.models.chat_schemas import (
    FollowUpChatRequest,
    FollowUpChatResponse,
)

from app.models.database_models import (
    User,
)

from app.services.auth_service import (
    get_current_user,
)

from app.services.chat_service import (
    generate_follow_up_answer,
)

from app.services.reading_session_service import (
    get_user_reading_session,
)


logger = logging.getLogger(
    __name__
)


router = APIRouter(
    prefix="/api/chat",
    tags=["Reading Chat"],
)


# ============================================================
# FOLLOW-UP CHAT
# ============================================================

@router.post(
    "/follow-up",
    response_model=FollowUpChatResponse,
)
def follow_up_chat(

    request: FollowUpChatRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Continue a persisted reading session.

    The reading session must belong to the
    currently authenticated user.
    """

    # ========================================================
    # VERIFY SESSION OWNERSHIP
    # ========================================================

    reading_session = (
        get_user_reading_session(

            db=db,

            user_id=(
                current_user.id
            ),

            session_id=(
                request.session_id
            ),
        )
    )


    if reading_session is None:

        raise HTTPException(
            status_code=404,

            detail=(
                "Reading session not found."
            ),
        )


    # ========================================================
    # GENERATE FOLLOW-UP
    # ========================================================

    try:

        return generate_follow_up_answer(

            db=db,

            reading_session=(
                reading_session
            ),

            request=request,

            current_user=(
                current_user
            ),
        )


    # ========================================================
    # GEMINI API ERRORS
    # ========================================================

    except errors.APIError as error:

        error_code = getattr(
            error,
            "code",
            None,
        )


        # ----------------------------------------------------
        # QUOTA / RATE LIMIT
        # ----------------------------------------------------

        if error_code == 429:

            logger.warning(
                (
                    "Gemini quota/rate limit "
                    "reached for user ID %s, "
                    "reading session %s."
                ),
                current_user.id,
                reading_session.id,
            )


            raise HTTPException(
                status_code=429,

                detail=(
                    "AI usage limit reached. "
                    "Please wait a moment and "
                    "try your question again."
                ),

            ) from error


        # ----------------------------------------------------
        # TEMPORARY PROVIDER ERROR
        # ----------------------------------------------------

        if error_code in {
            500,
            502,
            503,
            504,
        }:

            logger.warning(
                (
                    "Gemini temporarily "
                    "unavailable for user ID %s. "
                    "Code: %s"
                ),
                current_user.id,
                error_code,
            )


            raise HTTPException(
                status_code=503,

                detail=(
                    "The AI service is "
                    "temporarily unavailable. "
                    "Please try again shortly."
                ),

            ) from error


        # ----------------------------------------------------
        # OTHER PROVIDER ERROR
        # ----------------------------------------------------

        logger.exception(
            (
                "Gemini API error during "
                "persistent follow-up for "
                "user ID %s. Code: %s"
            ),
            current_user.id,
            error_code,
        )


        raise HTTPException(
            status_code=502,

            detail=(
                "The AI provider could not "
                "process the follow-up request."
            ),

        ) from error


    # ========================================================
    # FASTAPI ERROR
    # ========================================================

    except HTTPException:

        raise


    # ========================================================
    # UNEXPECTED ERROR
    # ========================================================

    except Exception as error:

        logger.exception(
            (
                "Persistent follow-up chat "
                "failed for user ID %s, "
                "session ID %s."
            ),
            current_user.id,
            reading_session.id,
        )


        raise HTTPException(
            status_code=500,

            detail=(
                "The follow-up response "
                "could not be generated."
            ),

        ) from error