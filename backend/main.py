import os

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
import ast
import cv2
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import gc
import onnxruntime as ort
from groq import Groq
from dotenv import load_dotenv
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"

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

# --- HELPER: ROTATING GROQ CALL WITH FALLBACK & TOKEN PROTECTION ---
def prepare_messages_for_llm(messages, max_history=8):
    """
    Trims and deduplicates messages so prompts remain lightweight.
    This prevents rate-limit (TPM/RPM) exhaustion on Groq.
    """
    if not messages:
        return []
    system_msgs = [m for m in messages if m.get("role") == "system"]
    non_system = [m for m in messages if m.get("role") != "system"]
    
    # Deduplicate consecutive identical messages
    deduped = []
    for m in non_system:
        if not deduped or deduped[-1].get("content") != m.get("content"):
            deduped.append(m)
            
    trimmed = deduped[-max_history:]
    return (system_msgs[:1] + trimmed) if system_msgs else trimmed

def get_groq_response(messages, model="groq/compound-mini", temperature=0.7, max_tokens=500):
    """
    Tries each API key and model fallback to avoid exhausting rate limits.
    If content is empty (e.g. reasoning models), uses reasoning field or fallback model.
    """
    if not GROQ_API_KEYS:
        return "The spirits are listening in silence (No Groq API keys configured)."

    trimmed_messages = prepare_messages_for_llm(messages, max_history=8)
    
    # Candidate models in order of priority: fast & token-efficient first
    models_to_try = [model]
    for m in ["groq/compound-mini", "openai/gpt-oss-20b"]:
        if m not in models_to_try:
            models_to_try.append(m)

    for m_name in models_to_try:
        for index, api_key in enumerate(GROQ_API_KEYS):
            try:
                client = Groq(api_key=api_key)
                completion = client.chat.completions.create(
                    messages=trimmed_messages,
                    model=m_name,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                
                raw_text = completion.choices[0].message.content or ""
                if not raw_text.strip():
                    raw_text = getattr(completion.choices[0].message, "reasoning", "") or ""

                # Strip internal reasoning think tags if present
                raw_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL)
                clean_text = raw_text.replace('*', '').replace('#', '').strip()
                
                if clean_text:
                    return clean_text
            except Exception as e:
                print(f"Notice: Model {m_name} on Key #{index + 1} issue: {e}. Trying next available fallback...")
                continue
                
    # Graceful in-character fallback response so endpoints never crash with 500
    return (
        "The celestial veil is thick at this moment and the spirits whisper patience. "
        "Reflect upon your question and consult the oracle once more in a brief moment."
    )

# ==========================================
# ONNX PALM MODEL
# ==========================================
try:
    onnx_model_path = os.path.join(
        os.path.dirname(__file__),
        "best.onnx"
    )

    onnx_session = ort.InferenceSession(
        onnx_model_path,
        providers=["CPUExecutionProvider"]
    )

    onnx_input_name = onnx_session.get_inputs()[0].name

    # Read class names exported by Ultralytics
    metadata = onnx_session.get_modelmeta().custom_metadata_map
    if "names" in metadata:
        try:
            try:
                class_names = json.loads(metadata["names"])
            except Exception:
                class_names = ast.literal_eval(metadata["names"])

            if isinstance(class_names, dict):
                class_names = {
                    int(k): str(v)
                    for k, v in class_names.items()
                }
            else:
                class_names = {
                    i: str(name)
                    for i, name in enumerate(class_names)
                }

        except Exception:
            class_names = {}
    else:
        class_names = {}

    print("ONNX Palm Model loaded successfully!")
    print(f"Palm classes: {class_names}")

except Exception as e:
    onnx_session = None
    onnx_input_name = None
    class_names = {}
    print(f"Warning: ONNX palm model could not be loaded: {e}")

# Initialize Tarot Dataset
print("Loading Tarot Dataset...")
tarot_dataset_path = os.path.join(os.path.dirname(__file__), "tarot_data")

with open(
    os.path.join(tarot_dataset_path, "tarot-images.json"),
    "r",
    encoding="utf-8"
) as f:
    tarot_cards = json.load(f)["cards"]

tarot_image_folder = os.path.join(tarot_dataset_path, "cards")

print("Tarot Dataset Loaded successfully!")

# ==========================================
# 2. DATA MODELS
# ==========================================
class ChatRequest(BaseModel):
    message: str
    history: list = []
    session_id: str | None = None  

class TarotRequest(BaseModel):
    user_name: str = "Seeker"
    user_question: str
    session_id: str | None = None  

# --- NEW OTP DATA MODELS ---
class OTPRequest(BaseModel):
    contact: str  # Can be email or phone

class VerifyRequest(BaseModel):
    contact: str
    otp: str

# ==========================================
# OTP AUTHENTICATION ENDPOINTS
# ==========================================
# Temporary in-memory store for our simulated OTPs
otp_storage = {}

@app.post("/api/request-otp")
async def request_otp(req: OTPRequest):
    # 1. Generate a random 6-digit code
    otp = str(random.randint(100000, 999999))
    
    # 2. Store it temporarily (expires if server restarts)
    otp_storage[req.contact] = otp
    
    # 3. Simulate sending an email/SMS by printing to your terminal
    print("\n" + "="*30)
    print(f"🔔 MOCK OTP ALERT")
    print(f"Sending to: {req.contact}")
    print(f"Your Code is: {otp}")
    print("="*30 + "\n")
    
    return {"message": "OTP sent successfully."}

@app.post("/api/verify-otp")
async def verify_otp(req: VerifyRequest):
    # 1. Check if the OTP matches what we stored
    stored_otp = otp_storage.get(req.contact)
    
    if not stored_otp or stored_otp != req.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")
        
    # 2. Clear the OTP so it can't be used again
    del otp_storage[req.contact]
    
    # 3. Check if user exists in DB, if not, create them silently
    user = db.get_user_by_username(req.contact)
    if not user:
        # We pass a dummy password since we rely on OTPs now
        db.create_user(req.contact, "OTP_AUTH", "seeker")
        user = db.get_user_by_username(req.contact)

    # 4. Generate Login Token
    token_data = {
        "sub": user[1],
        "role": user[3],
        "exp": datetime.utcnow() + timedelta(days=7) 
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "role": user[3], "username": user[1]}

def run_palm_onnx(img):
    if onnx_session is None:
        raise RuntimeError("Palm ONNX model is not loaded.")

    original_h, original_w = img.shape[:2]

    # Prevent extremely large uploads from consuming excessive RAM
    max_dimension = 1600

    if max(original_h, original_w) > max_dimension:
        scale = max_dimension / max(original_h, original_w)
        new_w = int(original_w * scale)
        new_h = int(original_h * scale)

        img = cv2.resize(
            img,
            (new_w, new_h),
            interpolation=cv2.INTER_AREA
        )

    # Ultralytics-style letterbox to 640x640
    h, w = img.shape[:2]
    scale = min(640 / w, 640 / h)

    new_w = int(round(w * scale))
    new_h = int(round(h * scale))

    resized = cv2.resize(
        img,
        (new_w, new_h),
        interpolation=cv2.INTER_LINEAR
    )

    canvas = np.full((640, 640, 3), 114, dtype=np.uint8)

    pad_x = (640 - new_w) // 2
    pad_y = (640 - new_h) // 2

    canvas[
        pad_y:pad_y + new_h,
        pad_x:pad_x + new_w
    ] = resized

    # BGR -> RGB
    input_image = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)

    # Normalize
    input_image = input_image.astype(np.float32) / 255.0

    # HWC -> CHW
    input_tensor = np.transpose(input_image, (2, 0, 1))[None]

    outputs = onnx_session.run(
        None,
        {onnx_input_name: input_tensor}
    )

    predictions = outputs[0][0].T

    # YOLO11-seg:
    # 4 box values + 4 classes + 32 mask coefficients
    num_classes = 4
    num_mask_coeffs = 32

    boxes = predictions[:, :4]
    class_scores = predictions[:, 4:4 + num_classes]

    # Convert class logits to probabilities
    class_scores = 1 / (1 + np.exp(-np.clip(class_scores, -50, 50)))

    class_ids = np.argmax(class_scores, axis=1)
    confidences = class_scores[
        np.arange(len(class_scores)),
        class_ids
    ]

    # Confidence filtering
    keep = confidences >= 0.25

    boxes = boxes[keep]
    confidences = confidences[keep]
    class_ids = class_ids[keep]

    if len(boxes) == 0:
        return [], img

    # xywh -> xyxy
    xyxy = np.zeros_like(boxes)

    xyxy[:, 0] = boxes[:, 0] - boxes[:, 2] / 2
    xyxy[:, 1] = boxes[:, 1] - boxes[:, 3] / 2
    xyxy[:, 2] = boxes[:, 0] + boxes[:, 2] / 2
    xyxy[:, 3] = boxes[:, 1] + boxes[:, 3] / 2

    # Remove letterbox padding
    xyxy[:, [0, 2]] -= pad_x
    xyxy[:, [1, 3]] -= pad_y

    # Convert back to image coordinates
    xyxy /= scale

    current_h, current_w = img.shape[:2]

    xyxy[:, [0, 2]] = np.clip(
        xyxy[:, [0, 2]],
        0,
        current_w - 1
    )

    xyxy[:, [1, 3]] = np.clip(
        xyxy[:, [1, 3]],
        0,
        current_h - 1
    )

    # NMS
    nms_boxes = []

    for box in xyxy:
        x1, y1, x2, y2 = box
        nms_boxes.append([
            float(x1),
            float(y1),
            float(x2 - x1),
            float(y2 - y1)
        ])

    indices = cv2.dnn.NMSBoxes(
        nms_boxes,
        confidences.tolist(),
        0.25,
        0.45
    )

    if len(indices) == 0:
        return [], img

    indices = np.array(indices).flatten()

    detections = []

    for i in indices:
        cls_id = int(class_ids[i])
        confidence = float(confidences[i])

        class_name = class_names.get(
            cls_id,
            str(cls_id)
        )

        detections.append({
            "name": class_name,
            "confidence": confidence,
            "box": xyxy[i].astype(int).tolist()
        })
    return detections, img

# ==========================================
# 3. PALMISTRY ENDPOINTS
# ==========================================
@app.post("/api/palm/analyze")
async def analyze_palm(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Protect Render from extremely large uploads
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Image is too large. Please upload an image below 10 MB."
            )

        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file."
            )

        detected_items, processed_img = run_palm_onnx(img)

        detected_text = []

        for item in detected_items:
            detected_text.append(
                f"{item['name']} "
                f"(Confidence: {item['confidence']:.2%})"
            )

        findings_summary = (
            "\n".join(
                f"- {item}"
                for item in set(detected_text)
            )
            if detected_text
            else "No lines distinctly identified."
        )

        # Draw detections
        for item in detected_items:
            x1, y1, x2, y2 = item["box"]

            label = (
                f"{item['name']} "
                f"{item['confidence']:.2%}"
            )

            cv2.rectangle(
                processed_img,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                processed_img,
                label,
                (x1, max(20, y1 - 8)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                1,
                cv2.LINE_AA
            )

        _, buffer = cv2.imencode(
            ".jpg",
            processed_img,
            [cv2.IMWRITE_JPEG_QUALITY, 85]
        )

        img_base64 = base64.b64encode(
            buffer
        ).decode("utf-8")

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
            {
                "role": "system",
                "content": "You are a wise, mystical Master Palm Reader."
            },
            {
                "role": "user",
                "content": initial_prompt
            }
        ]

        reading = get_groq_response(
            history,
            max_tokens=1000
        )

        history.append({
            "role": "assistant",
            "content": reading
        })

        user_id = db.get_or_create_user("Guest")

        session_id = db.start_session(
            user_id,
            "Palmistry",
            {
                "detected_lines": detected_text
            }
        )

        db.save_message(
            session_id,
            "system",
            "You are a wise, mystical Master Palm Reader."
        )

        db.save_message(
            session_id,
            "user",
            initial_prompt
        )

        db.save_message(
            session_id,
            "assistant",
            reading
        )

        # Release large arrays before returning
        del contents
        del nparr
        del img
        del processed_img
        del buffer

        gc.collect()

        return {
            "image_base64": img_base64,
            "reading": reading,
            "history": history,
            "session_id": session_id
        }

    except HTTPException:
        raise

    except Exception as e:
        gc.collect()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

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
        if req.session_id:
            db.save_message(req.session_id, "user", req.message)

        # Avoid duplicating the user message if already present at the end of history
        if not req.history or req.history[-1].get("content") != req.message:
            req.history.append({"role": "user", "content": req.message})

        answer = get_groq_response(req.history, max_tokens=400)
        req.history.append({"role": "assistant", "content": answer})
        
        if req.session_id:
            db.save_message(req.session_id, "assistant", answer)
            
        return {"reply": answer, "history": req.history}
    except Exception as e:
        print(f"Chat error: {e}")
        fallback_msg = "The spirits whisper that patience is needed as the energies shift. Please ask again in a moment."
        if not req.history or req.history[-1].get("content") != req.message:
            req.history.append({"role": "user", "content": req.message})
        req.history.append({"role": "assistant", "content": fallback_msg})
        return {"reply": fallback_msg, "history": req.history}
