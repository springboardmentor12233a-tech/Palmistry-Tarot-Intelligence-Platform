from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field
import datetime as dt


# ---------- Auth ----------

class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


TokenOut.model_rebuild()


# ---------- Readings ----------

class ReadingOut(BaseModel):
    id: int
    type: str
    title: str
    input_data: Any
    result_markdown: str
    images: Any
    pdf_path: Optional[str] = None
    created_at: dt.datetime

    class Config:
        from_attributes = True


class ReadingListItem(BaseModel):
    id: int
    type: str
    title: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class TarotDrawIn(BaseModel):
    spread: str = "three"  # single | three | relationship | career | celtic_cross | life_path


class TarotSelectIn(BaseModel):
    spread: str = "three"
    card_names: list[str] = Field(min_length=1, max_length=10)


class CombineIn(BaseModel):
    palm_reading_id: int
    tarot_reading_id: int


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: dt.datetime

    class Config:
        from_attributes = True
