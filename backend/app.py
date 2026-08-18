import os
import json
import uuid
import base64
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, EmailStr

# Load variables from a .env file (e.g. GEMINI_API_KEY) into the environment,
# if one exists. Safe no-op if python-dotenv isn't installed or no .env is present.
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass

import database
import auth
import tarot_engine
import palm_engine
import ai_synthesizer
import pdf_generator

app = FastAPI(title="Mystic Palm & Tarot API", version="1.0.0")

# Enable CORS for cross-origin or local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
STATIC_DIR = os.path.join(FRONTEND_DIR, "static")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")

os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# ----------------- Auth Models -----------------
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    zodiac_sign: Optional[str] = "Aries"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TarotDrawRequest(BaseModel):
    count: Optional[int] = 3
    seed: Optional[int] = None

class TarotInterpretRequest(BaseModel):
    cards: List[dict]
    question: str
    api_key: Optional[str] = None
    user_id: Optional[int] = None

class PDFReportRequest(BaseModel):
    user_name: Optional[str] = "Mystic Seeker"
    question: str
    reading_text: str
    cards: List[dict] = []
    palm_data: Optional[dict] = None

# Helper to verify token (accepts it either as an Authorization header or,
# for plain <a>/window.open GET requests like file downloads, a ?token= query param)
def get_current_user(authorization: Optional[str] = Header(None), token: Optional[str] = Query(None)):
    raw_token = None
    if authorization:
        raw_token = authorization.replace("Bearer ", "").strip()
    elif token:
        raw_token = token.strip()

    if not raw_token:
        return None

    if raw_token.startswith("token_"):
        parts = raw_token.split("_")
        if len(parts) >= 2 and parts[1].isdigit():
            user_id = int(parts[1])
            conn = database.get_db_connection()
            user = conn.execute("SELECT id, email, full_name, zodiac_sign FROM users WHERE id = ?", (user_id,)).fetchone()
            conn.close()
            if user:
                return dict(user)
    return None

# Dependency that ENFORCES authentication - use on every endpoint that should
# only be usable by a signed-in, registered user.
def require_user(user: Optional[dict] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in to use this feature.")
    return user

# ----------------- Auth Endpoints -----------------
@app.post("/api/auth/register")
def api_register(req: RegisterRequest):
    result = auth.register_user(
        email=req.email,
        full_name=req.full_name,
        password=req.password,
        zodiac_sign=req.zodiac_sign or "Aries"
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.post("/api/auth/login")
def api_login(req: LoginRequest):
    result = auth.login_user(email=req.email, password=req.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return result

@app.get("/api/auth/me")
def api_me(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"success": True, "user": user}

# ----------------- Tarot Endpoints (sign-in required) -----------------
@app.get("/api/tarot/deck")
def api_tarot_deck(current_user: dict = Depends(require_user)):
    deck = tarot_engine.load_deck()
    return {"success": True, "total": len(deck), "cards": deck}

@app.post("/api/tarot/draw")
def api_tarot_draw(req: TarotDrawRequest, current_user: dict = Depends(require_user)):
    deck = tarot_engine.load_deck()
    drawn = tarot_engine.draw_cards(deck=deck, count=req.count, seed=req.seed)
    return {"success": True, "drawn": drawn}

@app.post("/api/tarot/interpret")
def api_tarot_interpret(req: TarotInterpretRequest, current_user: dict = Depends(require_user)):
    reading_text, source = ai_synthesizer.generate_tarot_reading(
        cards=req.cards,
        question=req.question,
        api_key=req.api_key
    )

    # Save reading against the authenticated user
    conn = database.get_db_connection()
    conn.execute(
        "INSERT INTO readings (user_id, reading_type, question, tarot_cards, reading_text, source) VALUES (?, ?, ?, ?, ?, ?)",
        (current_user["id"], "tarot", req.question, json.dumps(req.cards), reading_text, source)
    )
    conn.commit()
    conn.close()
        
    return {
        "success": True,
        "question": req.question,
        "cards": req.cards,
        "reading_text": reading_text,
        "source": source
    }

# ----------------- Palm Analysis Endpoint (sign-in required) -----------------
@app.post("/api/palm/analyze")
async def api_palm_analyze(
    image: UploadFile = File(...),
    question: Optional[str] = Form("What does my palm say about my life journey?"),
    api_key: Optional[str] = Form(None),
    current_user: dict = Depends(require_user)
):
    image_bytes = await image.read()
    filename = f"{uuid.uuid4()}_{image.filename}"
    upload_path = os.path.join(UPLOADS_DIR, filename)
    with open(upload_path, "wb") as f:
        f.write(image_bytes)
        
    analysis = palm_engine.analyze_palm_image(image_bytes=image_bytes, filename=image.filename, api_key=api_key)
    if not analysis["success"]:
        raise HTTPException(status_code=400, detail=analysis["error"])
        
    analysis["image_url"] = f"/api/uploads/{filename}"
    return analysis

# ----------------- Combined Reading Endpoint (sign-in required) -----------------
@app.post("/api/readings/combined")
async def api_combined_reading(
    image: Optional[UploadFile] = File(None),
    cards_json: str = Form(...),
    question: str = Form("What should I focus on for my destiny?"),
    api_key: Optional[str] = Form(None),
    current_user: dict = Depends(require_user)
):
    user_id = current_user["id"]
    user_name = current_user.get("full_name") or "Mystic Seeker"
    try:
        cards = json.loads(cards_json)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cards_json payload")
        
    image_bytes = None
    palm_data = None
    image_url = None
    
    if image:
        image_bytes = await image.read()
        filename = f"{uuid.uuid4()}_{image.filename}"
        upload_path = os.path.join(UPLOADS_DIR, filename)
        with open(upload_path, "wb") as f:
            f.write(image_bytes)
        palm_data = palm_engine.analyze_palm_image(image_bytes, image.filename, api_key=api_key)
        image_url = f"/api/uploads/{filename}"
    else:
        # Default synthetic baseline palm data if no image uploaded
        palm_data = palm_engine.analyze_palm_image(b"default_palm_matrix", api_key=api_key)

    reading_text, source = ai_synthesizer.generate_combined_reading(
        palm_data=palm_data,
        cards=cards,
        question=question,
        image_bytes=image_bytes,
        api_key=api_key
    )

    # Generate PDF automatically
    pdf_filename = f"report_{uuid.uuid4().hex[:10]}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    pdf_generator.generate_pdf_report(
        user_name=user_name,
        question=question,
        reading_text=reading_text,
        cards=cards,
        palm_data=palm_data,
        palm_image_bytes=image_bytes,
        output_path=pdf_path
    )

    # Save to DB if user_id present
    reading_id = None
    if user_id:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO readings 
            (user_id, reading_type, question, tarot_cards, palm_data, reading_text, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (user_id, "combined", question, json.dumps(cards), json.dumps(palm_data), reading_text, source)
        )
        reading_id = cursor.lastrowid
        conn.commit()
        conn.close()

    return {
        "success": True,
        "reading_id": reading_id,
        "question": question,
        "cards": cards,
        "palm_data": palm_data,
        "image_url": image_url,
        "reading_text": reading_text,
        "source": source,
        "pdf_download_url": f"/api/reports/download/{pdf_filename}"
    }

# ----------------- Reading History Endpoints (sign-in required) -----------------
@app.get("/api/readings/history")
def api_reading_history(current_user: dict = Depends(require_user)):
    conn = database.get_db_connection()
    rows = conn.execute(
        "SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
        (current_user["id"],)
    ).fetchall()
    conn.close()
    
    results = []
    for r in rows:
        item = dict(r)
        if item.get("tarot_cards"):
            try:
                item["tarot_cards"] = json.loads(item["tarot_cards"])
            except Exception:
                pass
        if item.get("palm_data"):
            try:
                item["palm_data"] = json.loads(item["palm_data"])
            except Exception:
                pass
        results.append(item)
        
    return {"success": True, "readings": results}

# ----------------- PDF Report Endpoints (sign-in required) -----------------
@app.post("/api/reports/generate-pdf")
def api_generate_pdf(req: PDFReportRequest, current_user: dict = Depends(require_user)):
    pdf_filename = f"report_{uuid.uuid4().hex[:10]}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    
    pdf_generator.generate_pdf_report(
        user_name=req.user_name,
        question=req.question,
        reading_text=req.reading_text,
        cards=req.cards,
        palm_data=req.palm_data,
        output_path=pdf_path
    )
    return {
        "success": True,
        "pdf_download_url": f"/api/reports/download/{pdf_filename}"
    }

@app.get("/api/reports/download/{filename}")
def api_download_report(filename: str, current_user: dict = Depends(require_user)):
    file_path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)

@app.get("/api/uploads/{filename}")
def api_get_uploaded_file(filename: str, current_user: dict = Depends(require_user)):
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

# ----------------- Frontend Static Serving -----------------
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return JSONResponse({"status": "Mystic Palm & Tarot API is running", "version": "1.0.0"})
