import os
import json
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://palmistry-frontend.vercel.app",
        "https://palmistry-frontend.onrender.com",
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./palmistry.db"
    SYNC_DATABASE_URL: str = "sqlite:///./palmistry.db"

    # Security & JWT
    JWT_SECRET: str = "super-secret-jwt-key-for-development-change-in-production-1234567890!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Groq AI
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"

    # Assets & Storage paths
    ASSETS_DIR: Path = BASE_DIR / "assets"
    TAROT_DATA_PATH: Path = BASE_DIR / "assets" / "tarot-images.json"
    TAROT_CARDS_DIR: Path = BASE_DIR / "assets" / "cards"
    PALM_UNET_CHECKPOINT: Path = BASE_DIR / "assets" / "checkpoint_aug_epoch70.pth"
    HAND_LANDMARKER_PATH: Path = BASE_DIR / "assets" / "hand_landmarker.task"
    OUTPUT_DIR: Path = BASE_DIR / "results"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @field_validator(
        "ASSETS_DIR",
        "TAROT_DATA_PATH",
        "TAROT_CARDS_DIR",
        "PALM_UNET_CHECKPOINT",
        "HAND_LANDMARKER_PATH",
        "OUTPUT_DIR",
        mode="before",
    )
    @classmethod
    def resolve_paths(cls, v: Union[str, Path]) -> Path:
        if isinstance(v, Path):
            return v
        path = Path(v)
        if not path.is_absolute():
            return BASE_DIR / path
        return path


settings = Settings()
