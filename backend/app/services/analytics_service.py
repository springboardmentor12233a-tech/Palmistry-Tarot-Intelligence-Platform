import json
import sqlite3
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


BACKEND_DIR = Path(__file__).resolve().parents[2]

DATABASE_PATH = (
    BACKEND_DIR
    / "app"
    / "data"
    / "analytics.db"
)


def get_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


def initialize_analytics_database() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                created_at TEXT NOT NULL,

                category TEXT,
                spread TEXT,

                heart_line TEXT,
                head_line TEXT,
                life_line TEXT,

                tarot_cards TEXT NOT NULL DEFAULT '[]',

                upright_count INTEGER NOT NULL DEFAULT 0,
                reversed_count INTEGER NOT NULL DEFAULT 0,

                overall_insight_score REAL
            )
            """
        )

        connection.commit()


def record_completed_reading(
    request_data: dict[str, Any],
    response_data: dict[str, Any],
) -> int:
    initialize_analytics_database()

    reading_context = request_data.get(
        "reading_context",
        {},
    )

    palm_analysis = request_data.get(
        "palm_analysis",
        {},
    )

    tarot_analysis = request_data.get(
        "tarot_analysis",
        {},
    )

    tarot_cards = tarot_analysis.get(
        "cards",
        [],
    )

    category = reading_context.get(
        "category"
    )

    spread = tarot_analysis.get(
        "spread"
    )

    heart_line = palm_analysis.get(
        "heart_line"
    )

    head_line = palm_analysis.get(
        "head_line"
    )

    life_line = palm_analysis.get(
        "life_line"
    )

    card_names = []

    upright_count = 0
    reversed_count = 0

    for card in tarot_cards:
        card_name = card.get("name")

        if card_name:
            card_names.append(
                card_name
            )

        orientation = (
            str(
                card.get(
                    "orientation",
                    "",
                )
            )
            .strip()
            .lower()
        )

        if orientation == "upright":
            upright_count += 1

        elif orientation == "reversed":
            reversed_count += 1

    scores = response_data.get(
        "scores",
        {},
    )

    overall_score = scores.get(
        "overall_insight_score"
    )

    created_at = datetime.now(
        timezone.utc
    ).isoformat()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO readings (
                created_at,
                category,
                spread,
                heart_line,
                head_line,
                life_line,
                tarot_cards,
                upright_count,
                reversed_count,
                overall_insight_score
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                created_at,
                category,
                spread,
                heart_line,
                head_line,
                life_line,
                json.dumps(
                    card_names
                ),
                upright_count,
                reversed_count,
                overall_score,
            ),
        )

        connection.commit()

        return int(
            cursor.lastrowid
        )


def get_distribution(
    column_name: str,
) -> dict[str, int]:
    allowed_columns = {
        "category",
        "spread",
        "heart_line",
        "head_line",
        "life_line",
    }

    if column_name not in allowed_columns:
        raise ValueError(
            "Unsupported analytics column."
        )

    with get_connection() as connection:
        rows = connection.execute(
            f"""
            SELECT
                {column_name},
                COUNT(*) AS total
            FROM readings
            WHERE
                {column_name} IS NOT NULL
                AND TRIM({column_name}) != ''
            GROUP BY {column_name}
            ORDER BY total DESC
            """
        ).fetchall()

    return {
        str(row[column_name]): int(
            row["total"]
        )
        for row in rows
    }


def get_most_common_tarot_cards(
    limit: int = 10,
) -> list[dict[str, Any]]:
    card_counter = Counter()

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT tarot_cards
            FROM readings
            """
        ).fetchall()

    for row in rows:
        try:
            cards = json.loads(
                row["tarot_cards"]
                or "[]"
            )

        except json.JSONDecodeError:
            cards = []

        if isinstance(cards, list):
            for card in cards:
                if card:
                    card_counter[
                        str(card)
                    ] += 1

    return [
        {
            "name": card_name,
            "count": count,
        }
        for card_name, count
        in card_counter.most_common(
            limit
        )
    ]


def get_analytics_summary() -> dict[str, Any]:
    initialize_analytics_database()

    with get_connection() as connection:
        total_readings = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM readings
            """
        ).fetchone()["total"]

        total_palm_analyses = (
            connection.execute(
                """
                SELECT COUNT(*) AS total
                FROM readings
                WHERE
                    heart_line IS NOT NULL
                    OR head_line IS NOT NULL
                    OR life_line IS NOT NULL
                """
            ).fetchone()["total"]
        )

        total_tarot_readings = (
            connection.execute(
                """
                SELECT COUNT(*) AS total
                FROM readings
                WHERE spread IS NOT NULL
                """
            ).fetchone()["total"]
        )

        average_score = (
            connection.execute(
                """
                SELECT
                    AVG(
                        overall_insight_score
                    ) AS average_score
                FROM readings
                WHERE
                    overall_insight_score
                    IS NOT NULL
                """
            ).fetchone()[
                "average_score"
            ]
        )

        orientation_row = (
            connection.execute(
                """
                SELECT
                    COALESCE(
                        SUM(upright_count),
                        0
                    ) AS upright,

                    COALESCE(
                        SUM(reversed_count),
                        0
                    ) AS reversed
                FROM readings
                """
            ).fetchone()
        )

    return {
        "total_readings": int(
            total_readings
        ),

        "total_palm_analyses": int(
            total_palm_analyses
        ),

        "total_tarot_readings": int(
            total_tarot_readings
        ),

        "average_guidance_score": round(
            float(
                average_score or 0
            ),
            2,
        ),

        "spread_distribution":
            get_distribution(
                "spread"
            ),

        "category_distribution":
            get_distribution(
                "category"
            ),

        "heart_line_distribution":
            get_distribution(
                "heart_line"
            ),

        "head_line_distribution":
            get_distribution(
                "head_line"
            ),

        "life_line_distribution":
            get_distribution(
                "life_line"
            ),

        "orientation_distribution": {
            "upright": int(
                orientation_row[
                    "upright"
                ]
            ),
            "reversed": int(
                orientation_row[
                    "reversed"
                ]
            ),
        },

        "most_common_tarot_cards":
            get_most_common_tarot_cards(),
    }


def get_reading_history(
    limit: int = 20,
) -> list[dict[str, Any]]:
    initialize_analytics_database()

    safe_limit = max(
        1,
        min(limit, 100),
    )

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                id,
                created_at,
                category,
                spread,
                heart_line,
                head_line,
                life_line,
                tarot_cards,
                upright_count,
                reversed_count,
                overall_insight_score
            FROM readings
            ORDER BY id DESC
            LIMIT ?
            """,
            (
                safe_limit,
            ),
        ).fetchall()

    history = []

    for row in rows:
        try:
            tarot_cards = json.loads(
                row["tarot_cards"]
                or "[]"
            )

        except json.JSONDecodeError:
            tarot_cards = []

        history.append(
            {
                "id": int(
                    row["id"]
                ),

                "created_at":
                    row[
                        "created_at"
                    ],

                "category":
                    row[
                        "category"
                    ],

                "spread":
                    row[
                        "spread"
                    ],

                "heart_line":
                    row[
                        "heart_line"
                    ],

                "head_line":
                    row[
                        "head_line"
                    ],

                "life_line":
                    row[
                        "life_line"
                    ],

                "tarot_cards":
                    tarot_cards,

                "upright_count":
                    int(
                        row[
                            "upright_count"
                        ]
                    ),

                "reversed_count":
                    int(
                        row[
                            "reversed_count"
                        ]
                    ),

                "overall_insight_score":
                    row[
                        "overall_insight_score"
                    ],
            }
        )

    return history