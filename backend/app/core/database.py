from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Session,
    sessionmaker,
)

from app.config import settings


def normalize_database_url(
    database_url: str,
) -> str:
    """
    Convert common PostgreSQL URLs to the
    SQLAlchemy Psycopg 3 URL format.
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


DATABASE_URL = normalize_database_url(
    settings.DATABASE_URL
)


class Base(DeclarativeBase):
    pass


engine_options = {
    "pool_pre_ping": True,
}


if DATABASE_URL.startswith(
    "sqlite"
):
    engine_options[
        "connect_args"
    ] = {
        "check_same_thread": False,
    }


engine = create_engine(
    DATABASE_URL,
    **engine_options,
)


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
    database = SessionLocal()

    try:
        yield database

    finally:
        database.close()


def init_database() -> None:
    """
    Create application database tables.

    Import the models here so SQLAlchemy knows
    about them before create_all() is executed.
    """

    from app.models import database_models  # noqa: F401

    Base.metadata.create_all(
        bind=engine
    )