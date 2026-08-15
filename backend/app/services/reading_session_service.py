from typing import Any

from sqlalchemy import (
    func,
    select,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.database_models import (
    ReadingChatMessage,
    ReadingSession,
)


# ============================================================
# TITLE
# ============================================================

def create_session_title(
    category: str | None,
    question: str,
) -> str:

    clean_category = (
        str(category).strip()
        if category
        else "General"
    )

    clean_question = (
        str(question)
        .strip()
    )

    if not clean_question:

        return (
            f"{clean_category} Reading"
        )


    if len(clean_question) > 70:

        clean_question = (
            clean_question[:67]
            + "..."
        )


    return (
        f"{clean_category}: "
        f"{clean_question}"
    )


# ============================================================
# CREATE READING SESSION
# ============================================================

def create_reading_session(
    db: Session,
    user_id: int,
    request_data: dict[str, Any],
    response_data: dict[str, Any],
) -> ReadingSession:

    user_profile = (
        request_data.get(
            "user_profile",
            {},
        )
        or {}
    )

    reading_context = (
        request_data.get(
            "reading_context",
            {},
        )
        or {}
    )

    palm_analysis = (
        request_data.get(
            "palm_analysis",
            {},
        )
        or {}
    )

    tarot_analysis = (
        request_data.get(
            "tarot_analysis",
            {},
        )
        or {}
    )


    initial_reading = (
        response_data.get(
            "reading",
            {},
        )
        or {}
    )


    scores = (
        response_data.get(
            "scores",
            {},
        )
        or {}
    )


    question = str(
        reading_context.get(
            "question",
            "",
        )
        or ""
    ).strip()


    category = (
        reading_context.get(
            "category"
        )
    )


    spread = (
        tarot_analysis.get(
            "spread"
        )
    )


    session = ReadingSession(

        user_id=int(
            user_id
        ),

        title=create_session_title(
            category=category,
            question=question,
        ),

        original_question=(
            question
            or "General reading"
        ),

        category=category,

        spread=spread,

        user_profile=(
            user_profile
        ),

        reading_context=(
            reading_context
        ),

        palm_analysis=(
            palm_analysis
        ),

        tarot_analysis=(
            tarot_analysis
        ),

        initial_reading=(
            initial_reading
        ),

        scores=scores,

        is_archived=False,
    )


    db.add(
        session
    )

    db.commit()

    db.refresh(
        session
    )


    return session


# ============================================================
# GET OWN SESSION
# ============================================================

def get_user_reading_session(
    db: Session,
    user_id: int,
    session_id: int,
) -> ReadingSession | None:

    statement = (
        select(
            ReadingSession
        )
        .where(
            ReadingSession.id
            == int(session_id),

            ReadingSession.user_id
            == int(user_id),
        )
    )


    return db.scalar(
        statement
    )


# ============================================================
# GET USER SESSIONS
# ============================================================

def get_user_reading_sessions(
    db: Session,
    user_id: int,
    limit: int = 20,
) -> list[dict[str, Any]]:

    safe_limit = max(
        1,
        min(
            int(limit),
            100,
        ),
    )


    statement = (
        select(
            ReadingSession
        )
        .where(
            ReadingSession.user_id
            == int(user_id)
        )
        .order_by(
            ReadingSession.id.desc()
        )
        .limit(
            safe_limit
        )
    )


    sessions = list(
        db.scalars(
            statement
        ).all()
    )


    results = []


    for session in sessions:

        message_count_statement = (
            select(
                func.count(
                    ReadingChatMessage.id
                )
            )
            .where(
                ReadingChatMessage
                .session_id
                == session.id
            )
        )


        message_count = (
            db.scalar(
                message_count_statement
            )
            or 0
        )


        results.append(
            {
                "id":
                    session.id,

                "title":
                    session.title,

                "original_question":
                    session
                    .original_question,

                "category":
                    session.category,

                "spread":
                    session.spread,

                "created_at":
                    session.created_at,

                "updated_at":
                    session.updated_at,

                "message_count":
                    int(
                        message_count
                    ),
            }
        )


    return results


# ============================================================
# GET CHAT MESSAGES
# ============================================================

def get_session_messages(
    db: Session,
    session_id: int,
) -> list[
    ReadingChatMessage
]:

    statement = (
        select(
            ReadingChatMessage
        )
        .where(
            ReadingChatMessage
            .session_id
            == int(session_id)
        )
        .order_by(
            ReadingChatMessage
            .id.asc()
        )
    )


    return list(
        db.scalars(
            statement
        ).all()
    )


# ============================================================
# SESSION DETAIL
# ============================================================

def get_reading_session_detail(
    db: Session,
    user_id: int,
    session_id: int,
) -> dict[str, Any] | None:

    session = (
        get_user_reading_session(
            db=db,
            user_id=user_id,
            session_id=session_id,
        )
    )


    if session is None:

        return None


    messages = (
        get_session_messages(
            db=db,
            session_id=session.id,
        )
    )


    return {

        "id":
            session.id,

        "title":
            session.title,

        "original_question":
            session
            .original_question,

        "category":
            session.category,

        "spread":
            session.spread,

        "user_profile":
            session.user_profile
            or {},

        "reading_context":
            session.reading_context
            or {},

        "palm_analysis":
            session.palm_analysis
            or {},

        "tarot_analysis":
            session.tarot_analysis
            or {},

        "initial_reading":
            session.initial_reading
            or {},

        "scores":
            session.scores
            or {},

        "is_archived":
            bool(
                session.is_archived
            ),

        "created_at":
            session.created_at,

        "updated_at":
            session.updated_at,

        "messages": [

            {
                "id":
                    message.id,

                "role":
                    message.role,

                "content":
                    message.content,

                "created_at":
                    message.created_at,
            }

            for message
            in messages
        ],
    }