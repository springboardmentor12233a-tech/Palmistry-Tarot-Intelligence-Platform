import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

ENV_FILE = (
    BASE_DIR
    / ".env"
)

load_dotenv(
    ENV_FILE
)


class Settings:

    # =====================================================
    # PALM MODEL
    # =====================================================

    PALM_PYTHON_EXECUTABLE = os.getenv(
        "PALM_PYTHON_EXECUTABLE",
        (
            r"A:\PalmistryPalmVenv"
            r"\Scripts\python.exe"
        ),
    )

    PALM_RESULT_RETENTION_HOURS = int(
        os.getenv(
            "PALM_RESULT_RETENTION_HOURS",
            "24",
        )
    )


    # =====================================================
    # IMAGE VALIDATION
    # =====================================================

    MIN_IMAGE_WIDTH = int(
        os.getenv(
            "MIN_IMAGE_WIDTH",
            "200",
        )
    )

    MIN_IMAGE_HEIGHT = int(
        os.getenv(
            "MIN_IMAGE_HEIGHT",
            "200",
        )
    )

    MAX_IMAGE_WIDTH = int(
        os.getenv(
            "MAX_IMAGE_WIDTH",
            "8000",
        )
    )

    MAX_IMAGE_HEIGHT = int(
        os.getenv(
            "MAX_IMAGE_HEIGHT",
            "8000",
        )
    )

    MAX_UPLOAD_MB = int(
        os.getenv(
            "MAX_UPLOAD_MB",
            "10",
        )
    )


    # =====================================================
    # APPLICATION
    # =====================================================

    APP_NAME = os.getenv(
        "APP_NAME",
        (
            "Palmistry & Tarot "
            "Intelligence Platform"
        ),
    )

    APP_VERSION = os.getenv(
        "APP_VERSION",
        "4.0.0",
    )

    APP_ENV = os.getenv(
        "APP_ENV",
        "development",
    ).lower()

    DEBUG = (
        os.getenv(
            "DEBUG",
            "true",
        ).lower()
        == "true"
    )

    LOG_LEVEL = os.getenv(
        "LOG_LEVEL",
        "INFO",
    ).upper()


    # =====================================================
    # FRONTEND / CORS
    # =====================================================

    FRONTEND_URLS = [
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_URLS",
            (
                "http://localhost:5173,"
                "http://127.0.0.1:5173"
            ),
        ).split(",")
        if origin.strip()
    ]


    # =====================================================
    # HOST SECURITY
    # =====================================================

    ALLOWED_HOSTS = [
        host.strip()
        for host in os.getenv(
            "ALLOWED_HOSTS",
            (
                "127.0.0.1,"
                "localhost,"
                "testserver"
            ),
        ).split(",")
        if host.strip()
    ]


    # =====================================================
    # DATABASE
    # =====================================================

    LOCAL_DATABASE_PATH = (
        BASE_DIR
        / "app"
        / "data"
        / "platform.db"
    )

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        (
            "sqlite:///"
            + LOCAL_DATABASE_PATH.as_posix()
        ),
    )


    # =====================================================
    # AUTHENTICATION / JWT
    # =====================================================

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "",
    )

    JWT_ALGORITHM = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "60",
        )
    )


    # =====================================================
    # GOOGLE IDENTITY
    # =====================================================

    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID",
        "",
    )


    # =====================================================
    # ENVIRONMENT HELPERS
    # =====================================================

    @property
    def is_production(
        self,
    ) -> bool:

        return (
            self.APP_ENV
            == "production"
        )


settings = Settings()