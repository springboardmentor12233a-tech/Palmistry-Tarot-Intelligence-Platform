from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.palm import router as palm_router
from app.api.tarot import router as tarot_router
from app.api.reading import router as reading_router
from app.api.notifications import router as notifications_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(palm_router)
api_router.include_router(tarot_router)
api_router.include_router(reading_router)
api_router.include_router(notifications_router)
