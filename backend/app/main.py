from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, palm
from .database.connection import engine
from .models import user

# Create database tables
user.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Palmistry & Tarot Intelligence Platform API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(palm.router, prefix="/api/palm", tags=["palm"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Palmistry & Tarot API"}
