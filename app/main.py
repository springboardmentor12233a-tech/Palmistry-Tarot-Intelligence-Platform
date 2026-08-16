import logging
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles

from app.auth import (
    ROLE_LABELS,
    authenticate_user,
    create_access_token,
    decode_access_token,
    register_user,
)
from app.schemas import (
    ChatRequest,
    ChatResponse,
    FullReadingResponse,
    HealthCheckResponse,
    PalmAnalysisResponse,
    TarotDrawRequest,
    TarotDrawResponse,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
    UserStatusUpdateRequest,
)
from palmtarot.assets import ensure_all_tarot_assets_exist
from palmtarot.config import settings
from palmtarot.db import (
    ChatMessageRecord,
    PalmAnalysisRecord,
    TarotReadingRecord,
    db_manager,
)
from palmtarot.pipeline import PalmTarotPipeline

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("palmtarot.api")

app = FastAPI(
    title="AI Palmistry & Tarot Intelligence Platform API",
    version="1.0.0",
    description="Production REST API for hand landmark extraction, palm line segmentation, tarot draws, role-based auth, and AI narrative synthesis."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = PalmTarotPipeline()

# Ensure card assets exist locally & mount output/static directories
ensure_all_tarot_assets_exist()
app.mount("/pdf", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="pdf")
app.mount("/static/cards", StaticFiles(directory=str(settings.TAROT_ASSETS_DIR)), name="cards")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict[str, Any] | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user = db_manager.get_user_by_email(payload.get("sub", "")) or db_manager.get_user_by_username(payload.get("sub", ""))
    if not user or not user.is_active:
        return None
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
        "created_at": user.created_at,
        "is_active": user.is_active
    }


def get_current_active_user(user: dict[str, Any] | None = Depends(get_current_user)) -> dict[str, Any]:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    return user


def get_current_admin_user(user: dict[str, Any] = Depends(get_current_active_user)) -> dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")
    return user


# --- Authentication & User Management Endpoints ---

@app.post("/auth/register", response_model=UserProfileResponse, tags=["Authentication"])
def register(req: UserRegisterRequest):
    """Register a new account with email, password, and specified role."""
    if req.confirm_password and req.password != req.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match.")
    try:
        user_info = register_user(
            username=req.username or req.email.split("@")[0],
            password=req.password,
            role=req.role,
            full_name=req.name or req.full_name or "",
            email=req.email
        )
        return UserProfileResponse(
            id=user_info["id"],
            username=user_info["username"],
            role=user_info["role"],
            full_name=user_info["full_name"],
            email=user_info["email"],
            is_active=user_info.get("is_active", True),
            created_at=user_info.get("created_at", ""),
            reading_history=[]
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
def login(req: UserLoginRequest):
    """Authenticate user credentials (email or username) and return JWT bearer access token."""
    login_id = req.email or req.username
    user = authenticate_user(login_id, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    token = create_access_token({"sub": user["email"], "role": user["role"], "id": user["id"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        email=user["email"],
        role=user["role"],
        full_name=user["full_name"],
        id=user["id"]
    )


@app.get("/auth/me", response_model=UserProfileResponse, tags=["Authentication"])
def get_my_profile(current_user: dict[str, Any] = Depends(get_current_active_user)):
    """Fetch current user profile details and their past reading history from database."""
    user_id = current_user["id"]
    palm_records = db_manager.get_user_palm_analyses(user_id)
    tarot_records = db_manager.get_user_tarot_readings(user_id)
    chat_records = db_manager.get_user_chat_messages(user_id)

    history = []
    for p in palm_records:
        history.append({
            "id": p.id,
            "type": "Palm Analysis",
            "timestamp": p.timestamp,
            "question": "Palm Landmark & Structural Analysis",
            "answer": f"Palm Shape: {p.palm_shape} | Aspect Ratio: {p.aspect_ratio:.2f} | Cluster #{p.cluster_id}",
            "details": f"Palm Shape: {p.palm_shape}, Cluster: {p.cluster_id}, Aspect Ratio: {p.aspect_ratio:.2f}"
        })
    for t in tarot_records:
        cards_str = ", ".join([f"{c.get('name', 'Card')} ({c.get('orientation', 'Upright')})" for c in t.cards])
        interp = t.interpretation.get("personality") or t.interpretation.get("career_guidance") or "Tarot Cards Drawn"
        history.append({
            "id": t.id,
            "type": "Tarot Reading",
            "timestamp": t.timestamp,
            "question": t.user_question or "General Tarot Draw",
            "answer": f"Cards: {cards_str}\n\nSummary: {interp}",
            "details": f"Question: {t.user_question or 'General Reading'} | Cards: {cards_str}"
        })
    for c in chat_records:
        history.append({
            "id": c.id,
            "type": "Chat Q&A",
            "timestamp": c.timestamp,
            "question": c.user_message,
            "answer": c.bot_reply,
            "details": f"Q: {c.user_message}\nA: {c.bot_reply}"
        })

    history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    return UserProfileResponse(
        id=current_user["id"],
        username=current_user["username"],
        role=current_user["role"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at", ""),
        reading_history=history
    )


@app.get("/auth/demo-users", tags=["Authentication"])
def get_demo_users():
    """List pre-seeded demo user credentials for instant login testing."""
    demo_list = []
    passwords = {"user@gmail.com": "user123", "reader@gmail.com": "reader123", "consultant@gmail.com": "consultant123", "admin@gmail.com": "admin123"}
    for u in db_manager.get_all_users():
        demo_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "password": passwords.get(u.email, "password123"),
            "role": u.role,
            "role_label": ROLE_LABELS.get(u.role, u.role),
            "full_name": u.full_name
        })
    return {"demo_users": demo_list}


# --- Admin Dashboard Endpoints (Protected for Role == Admin) ---

@app.get("/admin/users", tags=["Admin Dashboards"])
def admin_get_users(admin: dict[str, Any] = Depends(get_current_admin_user)):
    """Users Dashboard endpoint: Fetch list of all registered users with signup date and activity status."""
    users = db_manager.get_all_users()
    res = []
    for u in users:
        res.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return {"users": res}


@app.put("/admin/users/{user_id}/status", tags=["Admin Dashboards"])
def admin_update_user_status(user_id: str, req: UserStatusUpdateRequest, admin: dict[str, Any] = Depends(get_current_admin_user)):
    """Update registered user active status or role assignment."""
    updates = {"is_active": req.is_active}
    if req.role:
        updates["role"] = req.role
    updated = db_manager.update_user(user_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User updated successfully.", "user": updated.model_dump()}


def validate_and_decode_image(file: UploadFile, image_bytes: bytes) -> np.ndarray:
    """Validate uploaded image format/size and decode to RGB numpy array."""
    if len(image_bytes) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds maximum limit of {settings.MAX_IMAGE_SIZE_MB}MB."
        )

    ext = Path(file.filename or "image.jpg").suffix.lower()
    if ext and ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{ext}'. Allowed formats: {list(settings.ALLOWED_EXTENSIONS)}"
        )

    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("OpenCV failed to decode image array")
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        return img_rgb
    except Exception as e:
        logger.error(f"Image decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupt or unreadable image file provided."
        )


@app.get("/", tags=["Health"])
def root_landing():
    """API root landing endpoint."""
    return {
        "title": "AI Palmistry & Tarot Intelligence Platform API",
        "status": "online",
        "version": "1.0.0",
        "documentation_url": "/docs",
        "health_check_url": "/health"
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
def health_check():
    """Liveness and readiness check endpoint."""
    return HealthCheckResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.APP_ENV
    )


@app.post("/analyze/palm", response_model=PalmAnalysisResponse, tags=["Palm Analytics"])
async def analyze_palm(
    file: UploadFile = File(...),
    session_id: str | None = Form(None),
    current_user: dict[str, Any] | None = Depends(get_current_user)
):
    """Accept hand image, extract landmarks, engineered features, cluster assignment, and rule report."""
    contents = await file.read()
    img_rgb = validate_and_decode_image(file, contents)

    try:
        palm_res = pipeline.run_palm_analysis(img_rgb)
        user_id = current_user["id"] if current_user else None
        session = db_manager.create_or_get_session(session_id=session_id, user_id=user_id)

        # Persist Palm Analysis Record to DB
        palm_record = PalmAnalysisRecord(
            session_id=session.session_id,
            user_id=user_id,
            palm_shape=palm_res["rule_report"].get("Palm_Shape", "Rectangular Palm"),
            aspect_ratio=float(palm_res["engineered_features"].get("aspect_ratio", 1.0)),
            cluster_id=int(palm_res["cluster"]["cluster_id"]),
            landmarks=palm_res["landmarks"],
            engineered_features=palm_res["engineered_features"],
            palm_lines=palm_res["palm_lines"],
            rule_report=palm_res["rule_report"]
        )
        db_manager.save_palm_analysis(palm_record)

        return PalmAnalysisResponse(
            landmarks=palm_res["landmarks"],
            engineered_features=palm_res["engineered_features"],
            cluster={
                "cluster_id": palm_res["cluster"]["cluster_id"],
                "pca_coords": list(palm_res["cluster"]["pca_coords"])
            },
            rule_report=palm_res["rule_report"],
            palm_lines=palm_res["palm_lines"]
        )
    except Exception as e:
        logger.error(f"Palm analysis failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Palm analysis failed: {e!s}"
        )


@app.post("/analyze/tarot", response_model=TarotDrawResponse, tags=["Tarot Analytics"])
def analyze_tarot(
    request: TarotDrawRequest,
    current_user: dict[str, Any] | None = Depends(get_current_user)
):
    """Draw N tarot cards with orientation, meanings, and position assignments."""
    try:
        res = pipeline.run_tarot_reading(num_cards=request.num_cards, seed=request.seed)
        user_id = current_user["id"] if current_user else None
        session = db_manager.create_or_get_session(session_id=request.session_id, user_id=user_id)

        # Persist Tarot Draw Record to DB
        tarot_record = TarotReadingRecord(
            session_id=session.session_id,
            user_id=user_id,
            num_cards=request.num_cards,
            cards=res["cards"]
        )
        db_manager.save_tarot_reading(tarot_record)

        return TarotDrawResponse(
            num_cards=res["num_cards"],
            cards=res["cards"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Tarot draw failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tarot draw failed: {e!s}"
        )


@app.post("/reading/full", response_model=FullReadingResponse, tags=["Integrated Pipeline"])
async def full_reading(
    file: UploadFile = File(...),
    user_question: str | None = Form(None),
    num_cards: int = Form(3),
    session_id: str | None = Form(None),
    current_user: dict[str, Any] | None = Depends(get_current_user)
):
    """Execute end-to-end integrated pipeline (Palm + Tarot + LLM + PDF report)."""
    if num_cards < 1 or num_cards > 78:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="num_cards must be between 1 and 78"
        )

    contents = await file.read()
    img_rgb = validate_and_decode_image(file, contents)

    try:
        res = pipeline.run_full_pipeline(
            image_np=img_rgb,
            user_question=user_question,
            num_cards=num_cards
        )
        pdf_file_name = Path(res["pdf_path"]).name
        pdf_url = f"/pdf/{pdf_file_name}"
        user_id = current_user["id"] if current_user else None
        session = db_manager.create_or_get_session(session_id=session_id, user_id=user_id)

        # Persist Records to DB
        db_manager.save_palm_analysis(PalmAnalysisRecord(
            session_id=session.session_id,
            user_id=user_id,
            palm_shape=res["palm_report"].get("Palm_Shape", "Rectangular Palm"),
            aspect_ratio=float(res["palm_features"].get("aspect_ratio", 1.0)),
            cluster_id=int(res["cluster"]["cluster_id"]),
            engineered_features=res["palm_features"],
            palm_lines=res["palm_lines"],
            rule_report=res["palm_report"]
        ))

        db_manager.save_tarot_reading(TarotReadingRecord(
            session_id=session.session_id,
            user_id=user_id,
            num_cards=num_cards,
            user_question=user_question,
            cards=res["tarot_reading"]["cards"],
            interpretation=res["interpretation"]
        ))

        return FullReadingResponse(
            user_question=res["user_question"],
            palm_features=res["palm_features"],
            palm_report=res["palm_report"],
            palm_lines=res["palm_lines"],
            cluster={
                "cluster_id": res["cluster"]["cluster_id"],
                "pca_coords": list(res["cluster"]["pca_coords"])
            },
            tarot_reading=TarotDrawResponse(
                num_cards=res["tarot_reading"]["num_cards"],
                cards=res["tarot_reading"]["cards"]
            ),
            interpretation=res["interpretation"],
            pdf_url=pdf_url,
            session_id=session.session_id
        )
    except Exception as e:
        logger.error(f"Full reading execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Full reading execution failed: {e!s}"
        )


@app.post("/chat", response_model=ChatResponse, tags=["Conversational AI Chatbot"])
def chat_with_ai(
    request: ChatRequest,
    current_user: dict[str, Any] | None = Depends(get_current_user)
):
    """Interactive conversational AI chatbot with DB history and palm/tarot reading context."""
    try:
        user_id = current_user["id"] if current_user else None
        session = db_manager.create_or_get_session(session_id=request.session_id, user_id=user_id)

        # Build reading context from request or DB lookup
        context = request.reading_context
        if not context and session.session_id:
            latest_palm = db_manager.get_latest_palm_analysis(session.session_id)
            latest_tarot = db_manager.get_latest_tarot_reading(session.session_id)

            if latest_palm or latest_tarot:
                context = {}
                if latest_palm:
                    context["palm_report"] = latest_palm.rule_report
                    context["palm_features"] = latest_palm.engineered_features
                    context["palm_lines"] = latest_palm.palm_lines
                    context["cluster"] = {"cluster_id": latest_palm.cluster_id}
                if latest_tarot:
                    context["tarot_reading"] = {"num_cards": latest_tarot.num_cards, "cards": latest_tarot.cards}

        messages = [{"role": msg.role, "content": msg.content} for msg in request.history]
        messages.append({"role": "user", "content": request.message})

        res = pipeline.llm_interpreter.chat_completion(
            messages=messages,
            reading_context=context
        )

        # Save Chat turn to DB
        chat_rec = ChatMessageRecord(
            session_id=session.session_id,
            user_id=user_id,
            user_message=request.message,
            bot_reply=res["reply"],
            reading_context_linked=context,
            suggested_followups=res.get("suggested_followups", [])
        )
        db_manager.save_chat_message(chat_rec)

        return ChatResponse(
            reply=res["reply"],
            suggested_followups=res.get("suggested_followups", []),
            session_id=session.session_id
        )
    except Exception as e:
        logger.error(f"Chat completion endpoint failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing error: {e!s}"
        )



