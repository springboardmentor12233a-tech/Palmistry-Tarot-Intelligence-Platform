# 🔮 Mystic Palm & Tarot AI • Full-Stack Web Application

An end-to-end full-stack web application integrating **AI Palmistry morphology analysis**, an interactive **78-card Rider-Waite Tarot deck**, **combined multi-modal psychic interpretations**, and **automated PDF report generation** with complete user authentication and email password reset flow.

---

## 🌟 Key Features

1. **Dual User Authentication**:
   - **Registered User Sign In**: Fast login with salted PBKDF2 hashed passwords and secure sessions.
   - **New User Registration**: Quick sign up capturing Full Name, Email, Password, and Sun/Zodiac Sign.
   - **Forgot Password & Email Reset**: Generates 1-hour secure tokens, dispatches via SMTP or provides an instant interactive test console link for immediate password recovery.

2. **Sacred Tarot Engine (78 Cards)**:
   - Complete Rider-Waite dataset with 22 Major Arcana + 56 Minor Arcana (Wands, Cups, Swords, Pentacles).
   - Realistic 3D card table with flip animations and Upright/Reversed dynamics.
   - 1-Card, 3-Card (Past • Present • Future), and 5-Card spreads with AI interpretation.

3. **AI Palmistry Engine**:
   - Real-time line detection and scoring (Heart Line, Head Line, Life Line, Fate Line).
   - Astrological Mounts analysis (Jupiter, Venus, Moon, Sun).
   - Interactive Canvas line overlay visualizer.

4. **Combined Multi-Modal Reading**:
   - Synthesizes your uploaded palm photograph + the drawn tarot spread + your life question into a unified, layered prophecy.
   - Structured breakdown: Celestial Overview, Heart & Love, Mind & Ambition, Vitality & Foundation, Oracle Blessing.

5. **Deluxe PDF Report Generation**:
   - One-click instant downloadable PDF report built with `ReportLab` containing the full analysis, tarot cards summary, palm line scores, and astrological blessings.

6. **Reading Chronicle History**:
   - Automatically archives readings to your account so you can review previous insights and re-download PDFs anytime.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

### 2. Launch the Application
```bash
python run.py
```

### 3. Open in Browser
Open your browser and navigate to:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🧪 Testing the API Endpoints

- **Server Root & Web UI**: `http://127.0.0.1:8000/`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Register Endpoint**: `POST /api/auth/register`
- **Login Endpoint**: `POST /api/auth/login`
- **Forgot Password Endpoint**: `POST /api/auth/forgot-password`
- **Tarot Draw Endpoint**: `POST /api/tarot/draw`
- **Palm Analysis Endpoint**: `POST /api/palm/analyze`
- **Combined Reading Endpoint**: `POST /api/readings/combined`
