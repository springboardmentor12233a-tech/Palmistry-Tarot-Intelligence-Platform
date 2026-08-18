from datetime import datetime, timezone
import json
import sqlite3
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "arcana.db"

router = APIRouter(
    prefix="/api/history",
    tags=["Reading History"],
)


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_history_database():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS reading_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reading_type TEXT NOT NULL,
            title TEXT NOT NULL,
            question TEXT DEFAULT '',
            result_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )

    connection.commit()
    connection.close()


init_history_database()


class HistoryCreateRequest(BaseModel):
    reading_type: str = Field(
        min_length=1,
        max_length=50,
    )

    title: str = Field(
        min_length=1,
        max_length=150,
    )

    question: str = Field(
        default="",
        max_length=1000,
    )

    result: dict


class HistoryResponse(BaseModel):
    id: int
    reading_type: str
    title: str
    question: str
    result: dict
    created_at: str


def row_to_history(row):
    try:
        result = json.loads(row["result_json"])
    except (TypeError, json.JSONDecodeError):
        result = {}

    return HistoryResponse(
        id=row["id"],
        reading_type=row["reading_type"],
        title=row["title"],
        question=row["question"] or "",
        result=result,
        created_at=row["created_at"],
    )


@router.post(
    "",
    response_model=HistoryResponse,
    status_code=201,
)
def save_reading(
    request: HistoryCreateRequest,
    user=Depends(get_current_user),
):
    created_at = datetime.now(timezone.utc).isoformat()

    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO reading_history (
            user_id,
            reading_type,
            title,
            question,
            result_json,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            user["id"],
            request.reading_type.strip(),
            request.title.strip(),
            request.question.strip(),
            json.dumps(
                request.result,
                ensure_ascii=False,
            ),
            created_at,
        ),
    )

    history_id = cursor.lastrowid

    connection.commit()

    row = connection.execute(
        """
        SELECT *
        FROM reading_history
        WHERE id = ? AND user_id = ?
        """,
        (
            history_id,
            user["id"],
        ),
    ).fetchone()

    connection.close()

    return row_to_history(row)


@router.get(
    "",
    response_model=list[HistoryResponse],
)
def get_reading_history(
    user=Depends(get_current_user),
):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT *
        FROM reading_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user["id"],),
    ).fetchall()

    connection.close()

    return [
        row_to_history(row)
        for row in rows
    ]


@router.get(
    "/{history_id}",
    response_model=HistoryResponse,
)
def get_reading(
    history_id: int,
    user=Depends(get_current_user),
):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT *
        FROM reading_history
        WHERE id = ? AND user_id = ?
        """,
        (
            history_id,
            user["id"],
        ),
    ).fetchone()

    connection.close()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Reading not found.",
        )

    return row_to_history(row)


@router.delete(
    "/{history_id}",
)
def delete_reading(
    history_id: int,
    user=Depends(get_current_user),
):
    connection = get_connection()

    cursor = connection.execute(
        """
        DELETE FROM reading_history
        WHERE id = ? AND user_id = ?
        """,
        (
            history_id,
            user["id"],
        ),
    )

    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Reading not found.",
        )

    return {
        "success": True,
        "message": "Reading deleted successfully.",
    }