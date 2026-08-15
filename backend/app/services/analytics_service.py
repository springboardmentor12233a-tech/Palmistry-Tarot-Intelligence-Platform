import json

from collections import Counter

from datetime import datetime

from typing import Any

from sqlalchemy import (
    func,
    or_,
    select,
)

from app.core.database import (
    Base,
    SessionLocal,
    engine,
)

from app.models.database_models import (
    AnalyticsReading,
    utc_now,
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def initialize_analytics_database() -> None:

    """
    Ensure SQLAlchemy database tables exist.

    The same database engine is used for:

    - SQLite during local development
    - PostgreSQL in production
    """

    Base.metadata.create_all(
        bind=engine
    )


# ============================================================
# INTERNAL HELPERS
# ============================================================

def normalize_optional_float(
    value: Any,
) -> float | None:

    if value is None:

        return None


    try:

        return float(
            value
        )


    except (
        TypeError,
        ValueError,
    ):

        return None


def normalize_tarot_cards(
    value: Any,
) -> list[str]:

    if value is None:

        return []


    if isinstance(
        value,
        str,
    ):

        try:

            decoded = json.loads(
                value
            )


            if isinstance(
                decoded,
                list,
            ):

                value = decoded


            else:

                return []


        except (
            json.JSONDecodeError,
            TypeError,
        ):

            return []


    if not isinstance(
        value,
        list,
    ):

        return []


    cards = []


    for item in value:

        if item is None:

            continue


        card_name = str(
            item
        ).strip()


        if card_name:

            cards.append(
                card_name
            )


    return cards


def format_created_at(
    value: Any,
) -> str:

    if value is None:

        return ""


    if isinstance(
        value,
        datetime,
    ):

        return value.isoformat()


    return str(
        value
    )


# ============================================================
# SAVE COMPLETED READING
# ============================================================

def record_completed_reading(

    request_data: dict[str, Any],

    response_data: dict[str, Any],

    user_id: int,

) -> int:

    initialize_analytics_database()


    # --------------------------------------------------------
    # READING CONTEXT
    # --------------------------------------------------------

    reading_context = (
        request_data.get(
            "reading_context",
            {},
        )
        or {}
    )


    # --------------------------------------------------------
    # PALM ANALYSIS
    # --------------------------------------------------------

    palm_analysis = (
        request_data.get(
            "palm_analysis",
            {},
        )
        or {}
    )


    # --------------------------------------------------------
    # TAROT ANALYSIS
    # --------------------------------------------------------

    tarot_analysis = (
        request_data.get(
            "tarot_analysis",
            {},
        )
        or {}
    )


    tarot_cards = (
        tarot_analysis.get(
            "cards",
            [],
        )
        or []
    )


    # --------------------------------------------------------
    # BASIC READING INFORMATION
    # --------------------------------------------------------

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


    heart_line = (
        palm_analysis.get(
            "heart_line"
        )
    )


    head_line = (
        palm_analysis.get(
            "head_line"
        )
    )


    life_line = (
        palm_analysis.get(
            "life_line"
        )
    )


    # --------------------------------------------------------
    # TAROT CARD INFORMATION
    # --------------------------------------------------------

    card_names: list[str] = []


    upright_count = 0


    reversed_count = 0


    for card in tarot_cards:

        if not isinstance(
            card,
            dict,
        ):

            continue


        card_name = (
            card.get(
                "name"
            )
        )


        if card_name:

            card_names.append(
                str(
                    card_name
                )
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


        if (
            orientation ==
            "upright"
        ):

            upright_count += 1


        elif (
            orientation ==
            "reversed"
        ):

            reversed_count += 1


    # --------------------------------------------------------
    # GUIDANCE SCORE
    # --------------------------------------------------------

    scores = (
        response_data.get(
            "scores",
            {},
        )
        or {}
    )


    overall_score = (
        normalize_optional_float(
            scores.get(
                "overall_insight_score"
            )
        )
    )


    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    analytics_reading = (
        AnalyticsReading(

            user_id=int(
                user_id
            ),

            created_at=utc_now(),

            category=category,

            spread=spread,

            heart_line=heart_line,

            head_line=head_line,

            life_line=life_line,

            tarot_cards=(
                card_names
            ),

            upright_count=(
                upright_count
            ),

            reversed_count=(
                reversed_count
            ),

            overall_insight_score=(
                overall_score
            ),
        )
    )


    with SessionLocal() as database:

        try:

            database.add(
                analytics_reading
            )


            database.commit()


            database.refresh(
                analytics_reading
            )


            return int(
                analytics_reading.id
            )


        except Exception:

            database.rollback()

            raise


# ============================================================
# DISTRIBUTION
# ============================================================

def get_distribution(

    column_name: str,

    user_id: int | None = None,

) -> dict[str, int]:

    allowed_columns = {

        "category":
            AnalyticsReading.category,

        "spread":
            AnalyticsReading.spread,

        "heart_line":
            AnalyticsReading.heart_line,

        "head_line":
            AnalyticsReading.head_line,

        "life_line":
            AnalyticsReading.life_line,

    }


    if (
        column_name
        not in allowed_columns
    ):

        raise ValueError(
            "Unsupported analytics column."
        )


    column = (
        allowed_columns[
            column_name
        ]
    )


    total_expression = (
        func.count(
            AnalyticsReading.id
        )
    )


    statement = (
        select(
            column,

            total_expression.label(
                "total"
            ),
        )

        .where(
            column.is_not(
                None
            ),

            func.trim(
                column
            ) != "",
        )
    )


    if user_id is not None:

        statement = (
            statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    statement = (
        statement
        .group_by(
            column
        )
        .order_by(
            total_expression.desc()
        )
    )


    with SessionLocal() as database:

        rows = (
            database.execute(
                statement
            )
            .all()
        )


    return {

        str(
            value
        ): int(
            total
        )

        for (
            value,
            total,
        ) in rows

        if value is not None
    }


# ============================================================
# MOST COMMON TAROT CARDS
# ============================================================

def get_most_common_tarot_cards(

    limit: int = 10,

    user_id: int | None = None,

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
            AnalyticsReading.tarot_cards
        )
    )


    if user_id is not None:

        statement = (
            statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    with SessionLocal() as database:

        stored_card_sets = list(
            database.scalars(
                statement
            ).all()
        )


    card_counter = Counter()


    for stored_cards in stored_card_sets:

        cards = (
            normalize_tarot_cards(
                stored_cards
            )
        )


        for card in cards:

            card_counter[
                card
            ] += 1


    return [

        {
            "name":
                card_name,

            "count":
                int(
                    count
                ),
        }

        for (
            card_name,
            count,
        )

        in card_counter.most_common(
            safe_limit
        )

    ]


# ============================================================
# ANALYTICS SUMMARY
# ============================================================

def get_analytics_summary(

    user_id: int | None = None,

) -> dict[str, Any]:

    initialize_analytics_database()


    # ========================================================
    # TOTAL READINGS
    # ========================================================

    total_statement = (
        select(
            func.count(
                AnalyticsReading.id
            )
        )
    )


    if user_id is not None:

        total_statement = (
            total_statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    # ========================================================
    # PALM ANALYSES
    # ========================================================

    palm_statement = (
        select(
            func.count(
                AnalyticsReading.id
            )
        )

        .where(
            or_(
                AnalyticsReading
                .heart_line
                .is_not(
                    None
                ),

                AnalyticsReading
                .head_line
                .is_not(
                    None
                ),

                AnalyticsReading
                .life_line
                .is_not(
                    None
                ),
            )
        )
    )


    if user_id is not None:

        palm_statement = (
            palm_statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    # ========================================================
    # TAROT READINGS
    # ========================================================

    tarot_statement = (
        select(
            func.count(
                AnalyticsReading.id
            )
        )

        .where(
            AnalyticsReading
            .spread
            .is_not(
                None
            )
        )
    )


    if user_id is not None:

        tarot_statement = (
            tarot_statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    # ========================================================
    # AVERAGE GUIDANCE SCORE
    # ========================================================

    score_statement = (
        select(
            func.avg(
                AnalyticsReading
                .overall_insight_score
            )
        )

        .where(
            AnalyticsReading
            .overall_insight_score
            .is_not(
                None
            )
        )
    )


    if user_id is not None:

        score_statement = (
            score_statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    # ========================================================
    # ORIENTATION COUNTS
    # ========================================================

    orientation_statement = (
        select(

            func.coalesce(
                func.sum(
                    AnalyticsReading
                    .upright_count
                ),
                0,
            ),

            func.coalesce(
                func.sum(
                    AnalyticsReading
                    .reversed_count
                ),
                0,
            ),
        )
    )


    if user_id is not None:

        orientation_statement = (
            orientation_statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    # ========================================================
    # EXECUTE
    # ========================================================

    with SessionLocal() as database:

        total_readings = int(
            database.scalar(
                total_statement
            )
            or 0
        )


        total_palm_analyses = int(
            database.scalar(
                palm_statement
            )
            or 0
        )


        total_tarot_readings = int(
            database.scalar(
                tarot_statement
            )
            or 0
        )


        average_score = (
            database.scalar(
                score_statement
            )
        )


        orientation_row = (
            database.execute(
                orientation_statement
            )
            .one()
        )


        upright_total = int(
            orientation_row[
                0
            ]
            or 0
        )


        reversed_total = int(
            orientation_row[
                1
            ]
            or 0
        )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "total_readings":
            total_readings,


        "total_palm_analyses":
            total_palm_analyses,


        "total_tarot_readings":
            total_tarot_readings,


        "average_guidance_score":
            round(
                float(
                    average_score
                    or 0
                ),
                2,
            ),


        "spread_distribution":
            get_distribution(
                "spread",
                user_id=user_id,
            ),


        "category_distribution":
            get_distribution(
                "category",
                user_id=user_id,
            ),


        "heart_line_distribution":
            get_distribution(
                "heart_line",
                user_id=user_id,
            ),


        "head_line_distribution":
            get_distribution(
                "head_line",
                user_id=user_id,
            ),


        "life_line_distribution":
            get_distribution(
                "life_line",
                user_id=user_id,
            ),


        "orientation_distribution": {

            "upright":
                upright_total,

            "reversed":
                reversed_total,
        },


        "most_common_tarot_cards":
            get_most_common_tarot_cards(
                user_id=user_id
            ),
    }


# ============================================================
# READING HISTORY
# ============================================================

def get_reading_history(

    limit: int = 20,

    user_id: int | None = None,

) -> list[dict[str, Any]]:

    initialize_analytics_database()


    safe_limit = max(
        1,
        min(
            int(limit),
            100,
        ),
    )


    statement = (
        select(
            AnalyticsReading
        )
    )


    if user_id is not None:

        statement = (
            statement.where(
                AnalyticsReading.user_id ==
                int(
                    user_id
                )
            )
        )


    statement = (
        statement
        .order_by(
            AnalyticsReading.id.desc()
        )
        .limit(
            safe_limit
        )
    )


    with SessionLocal() as database:

        rows = list(
            database.scalars(
                statement
            ).all()
        )


    history = []


    for row in rows:

        tarot_cards = (
            normalize_tarot_cards(
                row.tarot_cards
            )
        )


        history.append(
            {

                "id":
                    int(
                        row.id
                    ),


                "created_at":
                    format_created_at(
                        row.created_at
                    ),


                "category":
                    row.category,


                "spread":
                    row.spread,


                "heart_line":
                    row.heart_line,


                "head_line":
                    row.head_line,


                "life_line":
                    row.life_line,


                "tarot_cards":
                    tarot_cards,


                "upright_count":
                    int(
                        row.upright_count
                        or 0
                    ),


                "reversed_count":
                    int(
                        row.reversed_count
                        or 0
                    ),


                "overall_insight_score":
                    (
                        float(
                            row
                            .overall_insight_score
                        )

                        if (
                            row
                            .overall_insight_score
                            is not None
                        )

                        else None
                    ),
            }
        )


    return history