from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, EmailStr


class ReadingPreferences(BaseModel):
    primary_focus: Optional[str] = "General"
    include_reversed_cards: Optional[bool] = True
    notification_frequency: Optional[str] = "weekly"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: str = "user"
    age_group: Optional[str] = None
    interests: Optional[List[str]] = []
    spiritual_goals: Optional[List[str]] = []
    created_at: Optional[Union[datetime, str]] = None
    reading_preferences: Optional[Dict[str, Any]] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    age_group: Optional[str] = None
    interests: Optional[List[str]] = None
    spiritual_goals: Optional[List[str]] = None
    reading_preferences: Optional[Dict[str, Any]] = None


class ReadingHistoryItem(BaseModel):
    id: str
    date: str
    spread_type: str
    spread_title: str
    overall_score: int
    primary_archetype: str
    thumbnail_url: Optional[str] = None
    key_theme: str
