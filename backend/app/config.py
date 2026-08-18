import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite:///./palmtarot.db"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self):
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()

# Base directory of the backend package
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
RESULTS_DIR = os.path.join(STATIC_DIR, "results")
REPORTS_DIR = os.path.join(STATIC_DIR, "reports")
MODELS_DIR = os.path.join(BASE_DIR, "models")

for d in [STATIC_DIR, UPLOADS_DIR, RESULTS_DIR, REPORTS_DIR, MODELS_DIR]:
    os.makedirs(d, exist_ok=True)
