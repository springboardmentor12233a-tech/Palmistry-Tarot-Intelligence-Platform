# AI Palmistry & Tarot Intelligence Platform
A palm-image and tarot-card reading prototype built during the Infosys Springboard 7.0 internship. A user uploads a palm photo or asks a tarot question; the app analyzes the image or selects a card, then uses a language model to write a reading. React presents the experience, while a Python API connects image processing, tarot data, model calls, and storage.

> Readings are for entertainment and reflection only. They are not professional medical, financial, legal, or psychological advice.

## What it does

- **Palmistry:** accepts a palm photo, uses OpenCV (an image-processing library) to prepare it, and runs the trained YOLO model (an object-detection model) in `backend/best.pt` to find the project’s palm-line classes. The API returns an annotated image and an LLM-generated reading.
- **Tarot:** randomly selects a card and upright or reversed orientation, uses the bundled card meanings and artwork, and asks the LLM to interpret the draw in the context of the user's question.
- **Follow-up chat:** keeps the reading context for follow-up questions. The backend sends a short recent conversation to the LLM (large language model) and can try another configured Groq key or model if a request fails.
- **Local archive:** keeps reading sessions in the browser’s local storage (data saved in that browser on this device) so they can be revisited from the app.
- **Prototype account screens:** provides sign-up, sign-in, and password-reset flows for the demo.

## How a reading flows through the app

The frontend is the part a person uses. The backend is the service that processes requests and connects to the model and database.

1. The React interface collects a question or palm image.
2. The frontend sends the request to the FastAPI service.
3. For palmistry, the API decodes and downsizes the image, runs the local YOLO weights, and prepares the detected features for the reading prompt. For tarot, it selects a card, orientation, meanings, and image.
4. The backend sends a prompt (instructions plus relevant context) and recent conversation to Groq, a hosted language-model service, then returns the reading to the browser.
5. The backend stores reading sessions and messages in SQLite (a small database stored as a local file). The browser also stores the user’s archive locally.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite |
| Backend API | Python, FastAPI, Uvicorn |
| Computer vision | OpenCV, Ultralytics YOLO, PyTorch |
| Language model | Groq API |
| Persistence | SQLite (`backend/mystical_guidance.db`) |
| Image and tarot data | Pillow, bundled tarot JSON and card artwork |
| Authentication demo | Browser storage, simulated tokens, mock OTP flows |

### A few technical terms

| Term | Plain-language meaning in this project |
| --- | --- |
| **Frontend** | The screens and controls people use in the browser. |
| **Backend / API** | The Python service that receives app requests and returns results. An API is the agreed way the frontend and backend communicate. |
| **Computer vision** | Software that analyzes images. Here it prepares a palm photo and looks for features the model was trained to detect. |
| **YOLO model** | The image-detection model used by the palm-analysis endpoint. Its trained weights are stored in `backend/best.pt`. |
| **LLM** | A large language model that generates the written palm and tarot readings from instructions and context. |
| **SQLite** | A lightweight database saved as a file on the machine running the backend. |
| **Prompt** | The instructions and context sent to the language model for a reading. |

### Model development

- **Annotation:** learned the Roboflow workflow and labeled the palm images; Roboflow is not needed to run the app.
- **Dataset:** started with about 100 original annotated images and expanded the training set to roughly 300 with augmentation.
- **Training:** trained the YOLO model using Kaggle GPUs.

## Run locally

### Requirements

- Python 3.10 (the deployment manifest currently specifies 3.10.12)
- Node.js and npm
- A Groq API key for generated readings
- The included `backend/best.pt` weights for palm detection

### 1. Configure the backend

In PowerShell:

```powershell
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `GROQ_API_KEY_1`. `GROQ_API_KEY_2` is optional. Replace the example `SECRET_KEY` with a long random value. Keep `.env` private; it is ignored by Git.

Start the API from the `backend` directory:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

The API root is <http://localhost:8001/>. Health check: <http://localhost:8001/health>. Interactive API docs: <http://localhost:8001/docs>.

### 2. Start the frontend

In a second PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally <http://localhost:5173/>. The current frontend configuration points to the local API at `http://localhost:8001`.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API service information |
| `GET` | `/health` | Basic health response |
| `POST` | `/api/palm/analyze` | Upload a palm image as multipart form data (`file`) and receive detections, annotated image, and reading |
| `POST` | `/api/tarot/draw` | Draw a card using JSON fields `user_name`, `user_question`, and optional `session_id` |
| `POST` | `/api/chat` | Continue a conversation with `message`, `history`, and optional `session_id` |
| `POST` | `/api/request-otp` | Request a demo OTP for a `contact` |
| `POST` | `/api/verify-otp` | Verify a demo `contact` and `otp` |

## Project layout

```text
backend/
  main.py                 FastAPI routes, image analysis, tarot, chat, and Groq integration
  database.py             SQLite persistence for users, sessions, and chat messages
  best.pt                 Trained YOLO weights used for palm inference
  tarot_data/
    tarot-images.json     Card descriptions and meanings
    cards/                Tarot card artwork
frontend/
  src/App.jsx             Main UI and app flows
  src/config.js           Frontend API base URL
  src/components/         Shared visual components
  package.json            Frontend scripts and dependencies
render.yaml               Render backend deployment configuration
vercel.json               Vercel frontend build configuration
```

## What I learned and how I grew

- **Computer vision:** began with mathematical line detection, then moved to annotated examples when hand-written rules did not generalize across palm shapes.
- **Data preparation:** learned image annotation from scratch, created the initial dataset, and used augmentation to broaden it.
- **End-to-end engineering:** connected React uploads to FastAPI, OpenCV preprocessing, YOLO inference, and annotated-image responses.
- **LLM integration:** learned to shape prompts, preserve conversation context, limit recent history, and plan for API rate limits with key and model fallbacks.
- **Personal growth:** became more comfortable learning unfamiliar tools, changing direction when an approach stalled, and bringing separate components together into a working application.

## Current prototype limitations

- Account creation and sign-in are currently handled in the browser. Remembered credentials and reading archives use browser storage; the UI token is simulated. The password-reset OTP in the UI is shown in a browser alert.
- The backend's OTP endpoints are also demos: they print codes to the server console and do not send email or SMS. These flows are not production authentication.
- The backend currently uses SQLite, while the Vercel and Render configuration files describe deployment targets. The frontend API URL is presently fixed to localhost in `frontend/src/config.js`, so hosted use needs deployment-specific configuration.
- Model quality depends on the size and diversity of the annotated training data. Detections and generated interpretations can be wrong; treat the output as entertainment.

## Future directions

These ideas build on the current prototype and could guide a next iteration:

- Grow the palm-image dataset and evaluate model performance across varied lighting, hand positions, and image quality.
- Expand the reading experience with user-controlled preferences, clear usage limits, and privacy options.
- Add environment-based API configuration and durable hosted storage to support a smoother move from local development to deployment.
- Strengthen the account experience with secure server-side sessions and verified email or SMS delivery.
- Improve resilience with upload validation, request throttling, clearer error handling, and automated API coverage.
- Track model and API performance with privacy-conscious metrics so future improvements can be guided by real usage.

## Internship

Built as a project during **Infosys Springboard Internship 7.0**.

## Contributors

- Mentor
- A. Ramyaseshasri





https://github.com/user-attachments/assets/112ac2e2-f3a1-47a9-b61a-ecee21686b60





