import os
from pathlib import Path

from pydantic import ConfigDict
from pydantic_settings import BaseSettings

# Resolve root directory
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # Directory Paths
    BASE_DIR: Path = BASE_DIR
    DATASET_DIR: Path = BASE_DIR / "datasets"
    OUTPUT_DIR: Path = BASE_DIR / "output"
    MODEL_DIR: Path = BASE_DIR / "models"

    # Dataset Files
    HAND_INFO_CSV: Path = DATASET_DIR / "HandInfo.csv"
    TAROT_JSON: Path = DATASET_DIR / "tarot-images.json"

    # Model Files
    MEDIAPIPE_MODEL_PATH: Path = MODEL_DIR / "hand_landmarker.task"
    MEDIAPIPE_MODEL_URL: str = (
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    )
    UNET_WEIGHTS_PATH: Path = MODEL_DIR / "checkpoint_aug_epoch70.pth"

    # Database Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", os.getenv("DATABASE_URL", "mongodb://localhost:27017"))
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "palmtarot_db")

    # Asset Paths
    TAROT_ASSETS_DIR: Path = BASE_DIR / "palmtarot" / "assets" / "tarot_cards"

    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

    # Image constraints
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png"}


settings = Settings()

# Ensure directories exist
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
settings.TAROT_ASSETS_DIR.mkdir(parents=True, exist_ok=True)

