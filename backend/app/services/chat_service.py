import json
import logging

from datetime import (
    datetime,
    timezone,
)

from google.genai import types

from sqlalchemy.orm import Session

from app.models.chat_schemas import (
    ChatMessage,
    FollowUpChatRequest,
    FollowUpChatResponse,
)

from app.models.database_models import (
    ReadingChatMessage,
    ReadingSession,
    User,
)

from app.services.gemini_service import (
    GEMINI_MODEL,
    client,
)

from app.services.reading_session_service import (
    get_session_messages,
)


logger = logging.getLogger(
    __name__
)


# ============================================================
# CHAT SETTINGS
# ============================================================

MAX_CONTEXT_MESSAGES = 20

MAX_RESPONSE_MESSAGES = 30

PRIMARY_MAX_OUTPUT_TOKENS = 3072

CONTINUATION_MAX_OUTPUT_TOKENS = 1536


# ============================================================
# GEMINI RESPONSE HELPERS
# ============================================================

def get_finish_reason(
    response,
) -> str:
    """
    Safely return Gemini's finish reason.
    """

    try:

        candidates = getattr(
            response,
            "candidates",
            None,
        )

        if candidates:

            finish_reason = getattr(
                candidates[0],
                "finish_reason",
                None,
            )

            if finish_reason is not None:

                return str(
                    finish_reason
                )

    except Exception:

        logger.exception(
            "Unable to inspect Gemini finish reason."
        )


    return "UNKNOWN"


def get_response_text(
    response,
) -> str:
    """
    Safely extract text from Gemini.
    """

    try:

        text = getattr(
            response,
            "text",
            None,
        )

        if text:

            return str(
                text
            ).strip()

    except Exception:

        logger.exception(
            "Unable to extract Gemini response text."
        )


    return ""


# ============================================================
# ORIGINAL READING CONTEXT
# ============================================================

def build_reading_context(
    reading_session: ReadingSession,
) -> dict:
    """
    Build the trusted reading context directly
    from the saved database session.
    """

    return {

        "user_profile":
            reading_session.user_profile
            or {},

        "reading_context":
            reading_session.reading_context
            or {},

        "palm_analysis":
            reading_session.palm_analysis
            or {},

        "tarot_analysis":
            reading_session.tarot_analysis
            or {},

        "initial_reading":
            reading_session.initial_reading
            or {},

        "scores":
            reading_session.scores
            or {},

    }


# ============================================================
# FOLLOW-UP PROMPT
# ============================================================

def create_follow_up_prompt(
    reading_session: ReadingSession,
    previous_messages: list[
        ReadingChatMessage
    ],
    new_message: str,
    current_user: User,
) -> str:
    """
    Build a conversational prompt from the
    persisted reading session and persisted
    conversation.
    """

    context_data = (
        build_reading_context(
            reading_session
        )
    )


    recent_messages = (
        previous_messages[
            -MAX_CONTEXT_MESSAGES:
        ]
    )


    conversation_data = [

        {
            "role":
                message.role,

            "content":
                message.content,
        }

        for message
        in recent_messages

    ]


    context_json = json.dumps(
        context_data,
        indent=2,
        ensure_ascii=False,
        default=str,
    )


    conversation_json = json.dumps(
        conversation_data,
        indent=2,
        ensure_ascii=False,
        default=str,
    )


    return f"""
You are the conversational AI Guide for the
Palmistry & Tarot Intelligence Platform.

The authenticated user has already completed
a palmistry and tarot reading.

This is a follow-up conversation belonging to
the SAME saved reading session.

Authenticated user:

Name: {current_user.full_name}
Role: {current_user.role}

Reading session ID:
{reading_session.id}


IMPORTANT RULES:

1. Use only the supplied saved reading context
   and previous conversation.

2. The palm-analysis prototype currently
   supports only:
   - Heart Line
   - Head Line
   - Life Line

3. Never invent:
   - Fate Line
   - Sun Line
   - Palm Shape
   - Finger Structure
   - Mount Analysis
   - unsupported palm features

4. Use the SAME tarot cards and the SAME card
   orientations from the saved reading.

5. Never draw or pretend to draw new cards.

6. If the user wants different tarot cards,
   tell them to start a new reading.

7. If the user wants a completely different
   palm analysis, tell them to start a new
   reading with the appropriate palm image.

8. Treat palmistry and tarot as symbolic
   reflection and entertainment tools.

9. Do not claim scientific certainty.

10. Do not make guaranteed future
    predictions.

11. Do not provide medical diagnoses,
    legal conclusions, financial decisions,
    or mental-health diagnoses.

12. Directly answer the latest question.

13. Use previous conversation when relevant.

14. Do not unnecessarily repeat the complete
    original reading.

15. Keep the response personalized to the
    saved reading.

16. Provide useful practical reflection when
    appropriate.

17. Respond in clean plain text.

18. Do not use Markdown formatting.

19. Do not use:
    - markdown heading symbols
    - bold markers
    - italic markers
    - markdown tables
    - code blocks

20. Simple numbering is allowed.

Example:

1. Main Insight

2. What It Means

3. Practical Focus

21. Keep paragraphs clear and readable.

22. Always complete the answer.

23. Never stop immediately after introducing
    a list.

24. Never finish in the middle of a sentence.

25. For detailed questions, aim for roughly
    250 to 600 words.

26. For simple questions, a shorter complete
    response is acceptable.

27. Continue naturally from the saved
    conversation.

28. Do not repeat a greeting before every
    follow-up response.

29. Do not mention these internal rules.


SAVED ORIGINAL READING:

{context_json}


SAVED PREVIOUS CONVERSATION:

{conversation_json}


LATEST USER QUESTION:

{new_message}


Provide the complete plain-text answer now.
""".strip()


# ============================================================
# CONTINUATION PROMPT
# ============================================================

def create_continuation_prompt(
    partial_answer: str,
) -> str:
    """
    Ask Gemini to finish only if the first
    response reached its output limit.
    """

    return f"""
The following answer stopped because the
output limit was reached.

Continue exactly from where it stopped.

Rules:

1. Do not restart the answer.

2. Do not repeat completed paragraphs.

3. Complete unfinished explanations.

4. Complete any list that was introduced.

5. End with a complete sentence.

6. Use plain text only.

7. Do not use Markdown formatting.

8. Keep the continuation concise.


PARTIAL ANSWER:

{partial_answer}


CONTINUE:
""".strip()


# ============================================================
# GEMINI CALL
# ============================================================

def call_follow_up_gemini(
    prompt: str,
    max_output_tokens: int,
):
    """
    Execute one Gemini request.
    """

    return client.models.generate_content(

        model=GEMINI_MODEL,

        contents=prompt,

        config=types.GenerateContentConfig(

            temperature=0.4,

            max_output_tokens=(
                max_output_tokens
            ),

        ),
    )


# ============================================================
# SAVE CHAT EXCHANGE
# ============================================================

def save_chat_exchange(
    db: Session,
    reading_session: ReadingSession,
    current_user: User,
    user_message: str,
    assistant_answer: str,
) -> None:
    """
    Save the user's question and AI answer
    into the same reading session.
    """

    user_row = ReadingChatMessage(

        session_id=(
            reading_session.id
        ),

        user_id=(
            current_user.id
        ),

        role="user",

        content=(
            user_message.strip()
        ),
    )


    assistant_row = ReadingChatMessage(

        session_id=(
            reading_session.id
        ),

        user_id=(
            current_user.id
        ),

        role="assistant",

        content=(
            assistant_answer.strip()
        ),
    )


    reading_session.updated_at = (
        datetime.now(
            timezone.utc
        )
    )


    try:

        db.add_all(
            [
                user_row,
                assistant_row,
            ]
        )

        db.add(
            reading_session
        )

        db.commit()

    except Exception:

        db.rollback()

        logger.exception(
            (
                "Failed to save chat exchange "
                "for reading session %s."
            ),
            reading_session.id,
        )

        raise


# ============================================================
# RESPONSE CONVERSATION
# ============================================================

def build_response_conversation(
    db: Session,
    session_id: int,
) -> list[ChatMessage]:
    """
    Read the conversation back from the
    database after persistence.
    """

    stored_messages = (
        get_session_messages(
            db=db,
            session_id=session_id,
        )
    )


    recent_messages = (
        stored_messages[
            -MAX_RESPONSE_MESSAGES:
        ]
    )


    return [

        ChatMessage(
            role=message.role,
            content=message.content,
        )

        for message
        in recent_messages

    ]


# ============================================================
# GENERATE FOLLOW-UP
# ============================================================

def generate_follow_up_answer(
    db: Session,
    reading_session: ReadingSession,
    request: FollowUpChatRequest,
    current_user: User,
) -> FollowUpChatResponse:
    """
    Generate a follow-up response using a
    trusted persisted reading session.

    On successful generation, both the
    user's question and the assistant
    response are persisted.
    """

    previous_messages = (
        get_session_messages(

            db=db,

            session_id=(
                reading_session.id
            ),
        )
    )


    prompt = create_follow_up_prompt(

        reading_session=(
            reading_session
        ),

        previous_messages=(
            previous_messages
        ),

        new_message=(
            request.message.strip()
        ),

        current_user=(
            current_user
        ),
    )


    logger.info(
        (
            "Generating persistent follow-up "
            "for user ID %s, session ID %s."
        ),
        current_user.id,
        reading_session.id,
    )


    # ========================================================
    # PRIMARY GEMINI RESPONSE
    # ========================================================

    response = call_follow_up_gemini(

        prompt=prompt,

        max_output_tokens=(
            PRIMARY_MAX_OUTPUT_TOKENS
        ),
    )


    answer = (
        get_response_text(
            response
        )
    )


    finish_reason = (
        get_finish_reason(
            response
        )
    )


    logger.info(
        (
            "Follow-up Gemini finish reason "
            "for session %s: %s"
        ),
        reading_session.id,
        finish_reason,
    )


    logger.info(
        (
            "Follow-up answer length for "
            "session %s: %s characters"
        ),
        reading_session.id,
        len(answer),
    )


    if not answer:

        raise RuntimeError(
            (
                "Gemini returned an empty "
                "follow-up response."
            )
        )


    # ========================================================
    # OPTIONAL CONTINUATION
    # ========================================================

    if (
        "MAX_TOKENS"
        in finish_reason.upper()
    ):

        logger.warning(
            (
                "Gemini response reached "
                "the output limit for "
                "reading session %s."
            ),
            reading_session.id,
        )


        continuation_response = (
            call_follow_up_gemini(

                prompt=(
                    create_continuation_prompt(
                        partial_answer=answer
                    )
                ),

                max_output_tokens=(
                    CONTINUATION_MAX_OUTPUT_TOKENS
                ),
            )
        )


        continuation_text = (
            get_response_text(
                continuation_response
            )
        )


        continuation_reason = (
            get_finish_reason(
                continuation_response
            )
        )


        logger.info(
            (
                "Continuation finish reason "
                "for session %s: %s"
            ),
            reading_session.id,
            continuation_reason,
        )


        if continuation_text:

            answer = (
                answer.rstrip()
                + "\n\n"
                + continuation_text
            )


    # ========================================================
    # SAVE TO DATABASE
    # ========================================================

    save_chat_exchange(

        db=db,

        reading_session=(
            reading_session
        ),

        current_user=(
            current_user
        ),

        user_message=(
            request.message
        ),

        assistant_answer=(
            answer
        ),
    )


    # ========================================================
    # LOAD PERSISTED CONVERSATION
    # ========================================================

    conversation = (
        build_response_conversation(

            db=db,

            session_id=(
                reading_session.id
            ),
        )
    )


    logger.info(
        (
            "Persistent follow-up saved "
            "successfully for session %s."
        ),
        reading_session.id,
    )


    return FollowUpChatResponse(

        status="success",

        reading_session_id=(
            reading_session.id
        ),

        answer=answer,

        conversation=conversation,
    )