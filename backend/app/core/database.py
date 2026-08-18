from collections.abc import (
    Generator,
)

from sqlalchemy import (
    create_engine,
)

from sqlalchemy.orm import (
    DeclarativeBase,
    Session,
    sessionmaker,
)

from app.config import (
    settings,
)


# ============================================================
# DATABASE URL
# ============================================================

def normalize_database_url(
    database_url: str,
) -> str:

    """
    Convert common PostgreSQL URLs to
    SQLAlchemy's Psycopg 3 URL format.
    """

    if database_url.startswith(
        "postgres://"
    ):

        return database_url.replace(
            "postgres://",
            "postgresql+psycopg://",
            1,
        )


    if database_url.startswith(
        "postgresql://"
    ):

        return database_url.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1,
        )


    return database_url


DATABASE_URL = (
    normalize_database_url(
        settings.DATABASE_URL
    )
)


# ============================================================
# SQLALCHEMY BASE
# ============================================================

class Base(
    DeclarativeBase
):

    pass


# ============================================================
# ENGINE
# ============================================================

engine_options = {
    "pool_pre_ping":
        True,
}


if DATABASE_URL.startswith(
    "sqlite"
):

    engine_options[
        "connect_args"
    ] = {
        "check_same_thread":
            False,
    }


engine = create_engine(
    DATABASE_URL,
    **engine_options,
)


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[
    Session,
    None,
    None,
]:

    database = (
        SessionLocal()
    )


    try:

        yield database

    finally:

        database.close()


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_database() -> None:

    """
    Register every SQLAlchemy model and create
    missing application tables.

    create_all() creates new tables but does
    not destructively recreate existing ones.
    """

    from app.models import (  # noqa: F401
        database_models,
        password_reset_models,
    )


    Base.metadata.create_all(
        bind=engine
    )