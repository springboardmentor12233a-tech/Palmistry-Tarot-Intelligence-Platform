import json
import sqlite3

from datetime import (
    datetime,
    timezone,
)

from pathlib import Path

from sqlalchemy import (
    func,
    select,
)

from app.core.database import (
    SessionLocal,
    init_database,
)

from app.models.database_models import (
    AnalyticsReading,
    User,
)


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
)


LEGACY_DATABASE_PATH = (
    BACKEND_DIR
    / "app"
    / "data"
    / "analytics.db"
)


# ============================================================
# HELPERS
# ============================================================

def get_row_value(
    row,
    key,
    default=None,
):

    if (
        key in row.keys()
    ):

        return row[
            key
        ]


    return default


def parse_datetime(
    value,
):

    if not value:

        return datetime.now(
            timezone.utc
        )


    if isinstance(
        value,
        datetime,
    ):

        if (
            value.tzinfo
            is None
        ):

            return value.replace(
                tzinfo=timezone.utc
            )


        return value


    text = str(
        value
    ).strip()


    if text.endswith(
        "Z"
    ):

        text = (
            text[:-1]
            + "+00:00"
        )


    try:

        parsed = (
            datetime.fromisoformat(
                text
            )
        )


        if (
            parsed.tzinfo
            is None
        ):

            parsed = (
                parsed.replace(
                    tzinfo=timezone.utc
                )
            )


        return parsed


    except ValueError:

        return datetime.now(
            timezone.utc
        )


def parse_tarot_cards(
    value,
):

    if value is None:

        return []


    if isinstance(
        value,
        list,
    ):

        return [
            str(item)

            for item in value

            if item
        ]


    try:

        decoded = json.loads(
            str(
                value
            )
        )


        if isinstance(
            decoded,
            list,
        ):

            return [
                str(item)

                for item in decoded

                if item
            ]


    except (
        json.JSONDecodeError,
        TypeError,
    ):

        pass


    return []


def parse_optional_float(
    value,
):

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


def parse_optional_int(
    value,
):

    if value is None:

        return None


    try:

        return int(
            value
        )


    except (
        TypeError,
        ValueError,
    ):

        return None


# ============================================================
# MIGRATION
# ============================================================

def main():

    print(
        "Legacy analytics migration"
    )


    print(
        "Source:",
        LEGACY_DATABASE_PATH,
    )


    if not (
        LEGACY_DATABASE_PATH.exists()
    ):

        print(
            "No legacy analytics.db was found."
        )

        return


    # --------------------------------------------------------
    # CREATE NEW SQLALCHEMY TABLES
    # --------------------------------------------------------

    init_database()


    # --------------------------------------------------------
    # OPEN LEGACY SQLITE DATABASE
    # --------------------------------------------------------

    legacy_connection = (
        sqlite3.connect(
            LEGACY_DATABASE_PATH
        )
    )


    legacy_connection.row_factory = (
        sqlite3.Row
    )


    try:

        table = (
            legacy_connection.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE
                    type = 'table'
                    AND name = 'readings'
                """
            )
            .fetchone()
        )


        if table is None:

            print(
                "Legacy readings table was not found."
            )

            return


        legacy_rows = (
            legacy_connection.execute(
                """
                SELECT *
                FROM readings
                ORDER BY id ASC
                """
            )
            .fetchall()
        )


        print(
            "Legacy rows found:",
            len(
                legacy_rows
            ),
        )


        if not legacy_rows:

            print(
                "Nothing needs to be migrated."
            )

            return


        # ----------------------------------------------------
        # TARGET DATABASE
        # ----------------------------------------------------

        with SessionLocal() as database:

            target_count = int(
                database.scalar(
                    select(
                        func.count(
                            AnalyticsReading.id
                        )
                    )
                )
                or 0
            )


            if (
                target_count > 0
            ):

                print(
                    (
                        "STOPPED: analytics_readings "
                        "already contains "
                        f"{target_count} row(s)."
                    )
                )


                print(
                    (
                        "This safety check prevents "
                        "duplicate migration."
                    )
                )


                return


            existing_user_ids = set(

                database.scalars(
                    select(
                        User.id
                    )
                ).all()

            )


            migrated = 0


            for row in legacy_rows:

                legacy_user_id = (
                    parse_optional_int(
                        get_row_value(
                            row,
                            "user_id",
                        )
                    )
                )


                if (
                    legacy_user_id
                    not in existing_user_ids
                ):

                    legacy_user_id = (
                        None
                    )


                analytics_reading = (
                    AnalyticsReading(

                        user_id=(
                            legacy_user_id
                        ),

                        created_at=(
                            parse_datetime(
                                get_row_value(
                                    row,
                                    "created_at",
                                )
                            )
                        ),

                        category=(
                            get_row_value(
                                row,
                                "category",
                            )
                        ),

                        spread=(
                            get_row_value(
                                row,
                                "spread",
                            )
                        ),

                        heart_line=(
                            get_row_value(
                                row,
                                "heart_line",
                            )
                        ),

                        head_line=(
                            get_row_value(
                                row,
                                "head_line",
                            )
                        ),

                        life_line=(
                            get_row_value(
                                row,
                                "life_line",
                            )
                        ),

                        tarot_cards=(
                            parse_tarot_cards(
                                get_row_value(
                                    row,
                                    "tarot_cards",
                                )
                            )
                        ),

                        upright_count=(
                            parse_optional_int(
                                get_row_value(
                                    row,
                                    "upright_count",
                                    0,
                                )
                            )
                            or 0
                        ),

                        reversed_count=(
                            parse_optional_int(
                                get_row_value(
                                    row,
                                    "reversed_count",
                                    0,
                                )
                            )
                            or 0
                        ),

                        overall_insight_score=(
                            parse_optional_float(
                                get_row_value(
                                    row,
                                    "overall_insight_score",
                                )
                            )
                        ),
                    )
                )


                database.add(
                    analytics_reading
                )


                migrated += 1


            try:

                database.commit()


            except Exception:

                database.rollback()

                raise


            print(
                "Migrated rows:",
                migrated,
            )


            print(
                (
                    "Legacy analytics migration "
                    "completed successfully."
                )
            )


    finally:

        legacy_connection.close()


if __name__ == "__main__":

    main()