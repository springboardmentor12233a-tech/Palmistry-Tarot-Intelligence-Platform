from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = PROJECT_ROOT / "backend"


class Settings(BaseModel):
    project_root: Path = PROJECT_ROOT
    backend_root: Path = BACKEND_ROOT
    tarot_json_path: Path = PROJECT_ROOT / "data" / "tarot-images.json"
    tarot_cards_dir: Path = PROJECT_ROOT / "data" / "cards"
    palmistry_code_dir: Path = PROJECT_ROOT / "external_repos" / "palmistry" / "code"
    uploads_dir: Path = BACKEND_ROOT / "uploads"
    generated_outputs_dir: Path = BACKEND_ROOT / "generated_outputs"


@lru_cache
def get_settings() -> Settings:
    load_dotenv(BACKEND_ROOT / ".env")
    settings = Settings()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.generated_outputs_dir.mkdir(parents=True, exist_ok=True)
    return settings
