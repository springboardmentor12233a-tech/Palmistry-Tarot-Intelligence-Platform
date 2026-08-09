import os
import cv2
import json
import random
import base64
import numpy as np
import kagglehub
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from groq import Groq
from dotenv import load_dotenv

# --- 1. IMPORT DATABASE ---
from database import MysticalDB

# Load variables from .env file
load_dotenv()

# ==========================================
# 1. INITIALIZATION & SETUP
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. INITIALIZE DATABASE ---
db = MysticalDB()

# Load both API keys into a list
GROQ_API_KEYS = [
    os.environ.get("GROQ_API_KEY_1"),
    os.environ.get("GROQ_API_KEY_2")
]
# Remove any empty/None entries if only one key is provided
GROQ_API_KEYS = [key for key in GROQ_API_KEYS if key]

if not GROQ_API_KEYS:
    print("Warning: No Groq API keys found in .env file!")

# --- HELPER: ROTATING GROQ CALL ---
def get_groq_response(messages, model="llama-3.3-70b-versatile", temperature=0.7, max_tokens=800):
    """
    Tries each API key in the list. If one fails (rate limit/quota),
    it automatically falls back to the next key.
    """
    for index, api_key in enumerate(GROQ_API_KEYS):
        try:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # 1. Get the raw string from the AI
            raw_text = completion.choices[0].message.content
            
            # 2. Remove asterisks and hashtags
            clean_text = raw_text.replace('*', '').replace('#', '')
            
            # 3. Return the cleaned string
            return clean_text
            
        except Exception as e:
            print(f"Warning: Key #{index + 1} failed. Moving to next key... Error: {e}")
            continue
            
    # If every key in the list fails, raise an exception
    raise Exception("All available Groq API keys have been exhausted or failed.")

# Initialize YOLO Palm Model
try:
    yolo_model = YOLO("best.pt")
except Exception as e:
    print(f"Warning: YOLO model 'best.pt' not found. Palmistry won't work. {e}")

# Initialize Tarot Dataset
print("Loading Tarot Dataset...")
tarot_dataset_path = kagglehub.dataset_download("lsind18/tarot-json")
with open(os.path.join(tarot_dataset_path, "tarot-images.json"), "r", encoding="utf-8") as f:
    tarot_cards = json.load(f)["cards"]
tarot_image_folder = os.path.join(tarot_dataset_path, "cards")
print("Tarot Dataset Loaded successfully!")

# ==========================================
# 2. DATA MODELS
# ==========================================
class ChatRequest(BaseModel):
    message: str
    history: list
    session_id: str = None  # Added optionally so the DB knows which session to save to

class TarotRequest(BaseModel):
    user_name: str
    user_question: str
    session_id: str = None  # NEW: allows us to add cards to an existing chat!
# ==========================================
# 3. PALMISTRY ENDPOINTS
# ==========================================
@app.post("/api/palm/analyze")
async def analyze_palm(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = yolo_model.predict(source=img, conf=0.25, save=False)
        result = results[0]
        
        detected_items = []
        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                detected_items.append(f"{yolo_model.names[cls_id]} (Confidence: {confidence:.2%})")
                
        findings_summary = "\n".join([f"- {item}" for item in set(detected_items)]) if detected_items else "No lines distinctly identified."
        
        res_plotted = result.plot()
        _, buffer = cv2.imencode('.jpg', res_plotted)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        initial_prompt = f"""
        A computer vision system analyzed a photograph of a person's palm and identified these features:
        {findings_summary}
        
        Provide an insightful, engaging basic palm reading structured into:
        1. 💖 Heart & Emotional Life
        2. 🧠 Mind & Career Potential
        3. ✨ Energy & Life Journey
        End by inviting follow-up questions.
        """
        
        history = [
            {"role": "system", "content": "You are a wise, mystical Master Palm Reader."},
            {"role": "user", "content": initial_prompt}
        ]
        
        # Use our rotating helper function instead of direct client calls
        reading = get_groq_response(history, max_tokens=1000)
        history.append({"role": "assistant", "content": reading})
        
        # --- DB INTEGRATION: Save silently in background ---
        user_id = db.get_or_create_user("Guest")
        session_id = db.start_session(user_id, "Palmistry", {"detected_lines": detected_items})
        db.save_message(session_id, "system", "You are a wise, mystical Master Palm Reader.")
        db.save_message(session_id, "user", initial_prompt)
        db.save_message(session_id, "assistant", reading)
        
        return {"image_base64": img_base64, "reading": reading, "history": history, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 4. TAROT ENDPOINTS
# ==========================================
@app.post("/api/tarot/draw")
async def draw_tarot(req: TarotRequest):
    try:
        selected_card = random.choice(tarot_cards)
        is_upright = random.choice([True, False])
        orientation_str = "Upright" if is_upright else "Reversed"
        meanings = selected_card["meanings"]["light"] if is_upright else selected_card["meanings"]["shadow"]
        
        img_path = os.path.join(tarot_image_folder, selected_card["img"])
        img = Image.open(img_path)
        if not is_upright:
            img = img.rotate(180)
            
        buffered = BytesIO()
        img.save(buffered, format="JPEG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # PATH A: If we are adding a card to an EXISTING session
        if req.session_id:
            prompt = f"""
            [NEW CARD DRAWN]
            CARD: {selected_card['name']} ({orientation_str})
            KEYWORDS: {', '.join(selected_card['keywords'])}
            
            The user has drawn another card for clarification on their question: "{req.user_question}". 
            Integrate this new card into the current reading context and explain what it adds to the answer.
            """
            
            history = db.get_session_history(req.session_id)
            history.append({"role": "user", "content": prompt})
            db.save_message(req.session_id, "user", prompt)
            
            reading = get_groq_response(history, max_tokens=800)
            history.append({"role": "assistant", "content": reading})
            db.save_message(req.session_id, "assistant", reading)
            
            session_id = req.session_id
            
        # PATH B: If this is the FIRST card being drawn
        else:
            prompt = f"""
            You are reading for {req.user_name}. Question: "{req.user_question}"
            CARD DRAWN: {selected_card['name']} ({orientation_str})
            KEYWORDS: {', '.join(selected_card['keywords'])}
            MEANINGS: {chr(10).join(['- ' + m for m in meanings])}
            
            1. Greet {req.user_name}.
            2. Explain the card's imagery/energy.
            3. Deliver a personalized interpretation answering their question.
            4. Invite them to ask a follow-up question.
            """
            
            history = [
                {"role": "system", "content": "You are a mystical, empathetic tarot reader."},
                {"role": "user", "content": prompt}
            ]
            
            reading = get_groq_response(history, max_tokens=800)
            history.append({"role": "assistant", "content": reading})
            
            user_id = db.get_or_create_user(req.user_name)
            session_id = db.start_session(user_id, "Tarot", {"card": selected_card['name'], "orientation": orientation_str})
            db.save_message(session_id, "system", "You are a mystical, empathetic tarot reader.")
            db.save_message(session_id, "user", prompt)
            db.save_message(session_id, "assistant", reading)
        
        return {
            "image_base64": img_base64,
            "card_name": f"{selected_card['name']} ({orientation_str})",
            "reading": reading,
            "history": history,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 5. SHARED CHAT ENDPOINT
# ==========================================
@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        # 1. Save user message to DB if session_id exists
        if req.session_id:
            db.save_message(req.session_id, "user", req.message)

        # 2. Check if frontend already appended the user message to history
        user_msg_obj = {"role": "user", "content": req.message}
        if not req.history or req.history[-1] != user_msg_obj:
            req.history.append(user_msg_obj)
        
        # 3. Get response from Groq
        answer = get_groq_response(req.history, max_tokens=600)
        
        # 4. Append assistant response
        req.history.append({"role": "assistant", "content": answer})
        
        # 5. Save assistant response to DB
        if req.session_id:
            db.save_message(req.session_id, "assistant", answer)
            
        return {"reply": answer, "history": req.history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
