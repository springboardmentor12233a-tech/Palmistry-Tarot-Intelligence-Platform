from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_token
from app.db.models import User
from app.db.session import get_db

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Retrieves user from Authorization header or httpOnly cookie, returns None if unauthenticated."""
    token = None
    if auth and auth.credentials:
        token = auth.credentials
    else:
        token = request.cookies.get("access_token")

    if not token:
        return None

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalars().first()
    return user


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """Requires an authenticated user, raising 401 if missing."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or session expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
