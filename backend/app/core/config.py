from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    app_name: str = "Palmistry & Tarot Intelligence Platform"

    database_url: str = (
        "postgresql://postgres:Root%4012345@localhost:5432/"
        "palmistry_tarot_db"
    )

    jwt_secret: str = (
        "change_this_to_a_long_random_secret_for_development"
    )

    jwt_algorithm: str = "HS256"

    access_token_expire_minutes: int = 60

    openai_api_key: str = ""

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()