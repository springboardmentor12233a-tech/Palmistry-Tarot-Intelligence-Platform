from datetime import datetime, timedelta, timezone
from pathlib import Path
import os
import sqlite3

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "arcana.db"

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_THIS_SECRET_IN_ENV")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_auth_database():
    connection = get_connection()
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            age_group TEXT DEFAULT '',
            interests TEXT DEFAULT '',
            spiritual_goals TEXT DEFAULT '',
            reading_preferences TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)
    connection.commit()
    connection.close()


init_auth_database()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    age_group: str | None = None
    interests: str | None = None
    spiritual_goals: str | None = None
    reading_preferences: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    age_group: str
    interests: str
    spiritual_goals: str
    reading_preferences: str
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def normalize_email(email: str) -> str:
    return email.strip().lower()


def row_to_user(row) -> UserResponse:
    return UserResponse(
        id=row["id"],
        name=row["name"],
        email=row["email"],
        role=row["role"],
        age_group=row["age_group"] or "",
        interests=row["interests"] or "",
        spiritual_goals=row["spiritual_goals"] or "",
        reading_preferences=row["reading_preferences"] or "",
        created_at=row["created_at"],
    )


def create_access_token(user_id: int, role: str):
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(user_id), "role": role, "exp": expires}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_error
    except jwt.PyJWTError:
        raise credentials_error

    connection = get_connection()
    row = connection.execute(
        "SELECT * FROM users WHERE id = ?",
        (int(user_id),),
    ).fetchone()
    connection.close()

    if row is None:
        raise credentials_error

    return row


def require_roles(*roles):
    def dependency(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )
        return user
    return dependency


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(request: RegisterRequest):
    email = normalize_email(str(request.email))
    connection = get_connection()

    existing = connection.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if existing:
        connection.close()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    now = datetime.now(timezone.utc).isoformat()

    cursor = connection.execute(
        """
        INSERT INTO users
        (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, 'user', ?)
        """,
        (
            request.name.strip(),
            email,
            password_hash.hash(request.password),
            now,
        ),
    )

    user_id = cursor.lastrowid
    connection.commit()

    row = connection.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    connection.close()

    token = create_access_token(row["id"], row["role"])

    return TokenResponse(
        access_token=token,
        user=row_to_user(row),
    )


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = normalize_email(form_data.username)

    connection = get_connection()
    row = connection.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    connection.close()

    if row is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        valid_password = password_hash.verify(
            form_data.password,
            row["password_hash"],
        )
    except Exception:
        valid_password = False

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(row["id"], row["role"])

    return TokenResponse(
        access_token=token,
        user=row_to_user(row),
    )


@router.get("/me", response_model=UserResponse)
def current_user(user=Depends(get_current_user)):
    return row_to_user(user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    request: ProfileUpdateRequest,
    user=Depends(get_current_user),
):
    fields = {
        "name": request.name,
        "age_group": request.age_group,
        "interests": request.interests,
        "spiritual_goals": request.spiritual_goals,
        "reading_preferences": request.reading_preferences,
    }

    updates = []
    values = []

    for field, value in fields.items():
        if value is not None:
            updates.append(f"{field} = ?")
            values.append(value.strip())

    if not updates:
        return row_to_user(user)

    values.append(user["id"])

    connection = get_connection()
    connection.execute(
        f"UPDATE users SET {', '.join(updates)} WHERE id = ?",
        values,
    )
    connection.commit()

    row = connection.execute(
        "SELECT * FROM users WHERE id = ?",
        (user["id"],),
    ).fetchone()
    connection.close()

    return row_to_user(row)


@router.get("/admin/users", response_model=list[UserResponse])
def list_users(user=Depends(require_roles("admin"))):
    connection = get_connection()
    rows = connection.execute(
        "SELECT * FROM users ORDER BY created_at DESC"
    ).fetchall()
    connection.close()
    return [row_to_user(row) for row in rows]