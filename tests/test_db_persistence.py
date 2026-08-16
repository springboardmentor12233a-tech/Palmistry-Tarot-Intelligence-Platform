import uuid

from palmtarot.db import (
    ChatMessageRecord,
    PalmAnalysisRecord,
    TarotReadingRecord,
    UserModel,
    db_manager,
)


def test_session_creation_and_retrieval():
    sid = f"test_session_{uuid.uuid4().hex[:8]}"
    session = db_manager.create_or_get_session(session_id=sid, username="testuser")

    assert session.session_id == sid
    assert session.username == "testuser"


def test_user_persistence():
    uid = f"user_{uuid.uuid4().hex[:8]}"
    email = f"{uid}@gmail.com"

    user = UserModel(
        id=uid,
        email=email,
        username=uid,
        password_hash="$2b$12$dummyhashforpytest12345",
        full_name="Persistence Tester",
        role="user",
        is_active=True
    )
    saved_u = db_manager.save_user(user)
    assert saved_u.id == uid

    fetched_u = db_manager.get_user_by_email(email)
    assert fetched_u is not None
    assert fetched_u.full_name == "Persistence Tester"


def test_palm_analysis_persistence():
    sid = f"test_session_{uuid.uuid4().hex[:8]}"
    uid = f"user_{uuid.uuid4().hex[:8]}"
    db_manager.create_or_get_session(session_id=sid, user_id=uid)

    palm_rec = PalmAnalysisRecord(
        session_id=sid,
        user_id=uid,
        palm_shape="Square Palm",
        aspect_ratio=1.05,
        cluster_id=1,
        engineered_features={"aspect_ratio": 1.05, "palm_width": 120.0},
        palm_lines=[{"line": "Heart Line", "length_px": 160.0}],
        rule_report={"Palm_Shape": "Square Palm"}
    )
    saved = db_manager.save_palm_analysis(palm_rec)
    assert saved.id is not None

    retrieved = db_manager.get_latest_palm_analysis(sid)
    assert retrieved is not None
    assert retrieved.session_id == sid
    assert retrieved.palm_shape == "Square Palm"
    assert len(retrieved.palm_lines) == 1

    user_palms = db_manager.get_user_palm_analyses(uid)
    assert len(user_palms) >= 1
    assert user_palms[0].user_id == uid


def test_tarot_reading_persistence():
    sid = f"test_session_{uuid.uuid4().hex[:8]}"
    uid = f"user_{uuid.uuid4().hex[:8]}"
    db_manager.create_or_get_session(session_id=sid, user_id=uid)

    tarot_rec = TarotReadingRecord(
        session_id=sid,
        user_id=uid,
        num_cards=3,
        user_question="Career guidance",
        cards=[
            {"name": "The Fool", "orientation": "Upright", "position": "Past", "img": "m00.jpg"},
            {"name": "The Magician", "orientation": "Reversed", "position": "Present", "img": "m01.jpg"}
        ],
        interpretation={"career_guidance": "Bright prospects ahead"}
    )
    saved = db_manager.save_tarot_reading(tarot_rec)
    assert saved.id is not None

    retrieved = db_manager.get_latest_tarot_reading(sid)
    assert retrieved is not None
    assert retrieved.session_id == sid
    assert retrieved.num_cards == 3
    assert len(retrieved.cards) == 2

    user_tarots = db_manager.get_user_tarot_readings(uid)
    assert len(user_tarots) >= 1
    assert user_tarots[0].user_id == uid


def test_chat_message_persistence():
    sid = f"test_session_{uuid.uuid4().hex[:8]}"
    db_manager.create_or_get_session(session_id=sid)

    chat_rec = ChatMessageRecord(
        session_id=sid,
        user_message="How are tarot cards recommended?",
        bot_reply="Tarot cards are recommended based on your computed heart and head line lengths.",
        suggested_followups=["Tell me more about Heart Line."]
    )
    db_manager.save_chat_message(chat_rec)

    history = db_manager.get_chat_history(sid)
    assert len(history) >= 1
    last_msg = history[-1]
    assert last_msg.user_message == "How are tarot cards recommended?"
    assert "heart" in last_msg.bot_reply.lower()
