# Palmistry & Tarot Intelligence Platform

An AI-assisted web platform that combines **palmistry analysis**, **tarot readings**, **personalized interpretation**, **personality intelligence**, **life-trend analysis**, **guidance scoring**, **recommendations**, **saved reading history**, and **role-based dashboards** in one application.

The project was developed as an internship prototype using a **FastAPI backend**, **React/Vite frontend**, **SQLAlchemy database layer**, and **Gemini-powered AI interpretation**.

---

## Overview

The Palmistry & Tarot Intelligence Platform allows authenticated users to:

- Create and manage a personalized profile
- Upload and analyze a palm image
- Detect supported palm-line results
- Draw tarot cards
- Generate a combined AI-assisted reading
- View personality insights
- Review life-trend analysis
- Receive recommendations and guidance scores
- Save complete reading sessions
- Ask follow-up questions using the same saved reading context
- Download complete reading reports as PDF
- Email complete reading PDFs to the registered email address
- View reading history and notifications
- Delete their account permanently

The platform also supports specialist and administrator roles with dedicated dashboards.

---

## Current Prototype Scope

### Palm Analysis

The current palm-analysis prototype supports:

- Heart Line
- Head Line
- Life Line

The following are **not currently supported** and should not be presented as detected features:

- Fate Line
- Sun Line
- Palm Shape
- Finger Structure

### Tarot Reading

The current tarot engine supports a complete **78-card tarot deck** with:

- Upright meanings
- Reversed meanings
- Card keywords
- Tarot card images

Supported spreads:

- Single Card
- Past-Present-Future

Additional spreads can be added later as future extensions.

---

## Main Features

### Authentication & Account Management

- Email/password registration
- Email/password login
- Google Sign-In
- JWT-based authentication
- Role-based access control
- Forgot Password
- Reset Password through email
- Profile management
- Active/inactive account control
- User self-deletion
- Administrator user deletion
- Protected administrator accounts

### Palmistry Module

- Palm image upload
- Image validation
- Palm-line processing
- Heart Line result
- Head Line result
- Life Line result
- Palm analysis descriptions
- Processed image display
- Saved palm reading history

### Tarot Module

- 78-card tarot dataset
- Single Card draw
- Past-Present-Future draw
- Upright/reversed orientation
- Card meanings
- Keywords
- Tarot card images
- Saved tarot history

### AI Reading Engine

The AI reading workflow combines:

- User profile
- User question
- Reading category
- Palm results
- Tarot results

Generated outputs include:

- Overall Summary
- Palm Interpretation
- Tarot Interpretation
- Combined Interpretation
- Key Strengths
- Growth Areas
- Current Focus
- Key Message
- Reflection Question

### Personality Intelligence

Includes:

- Personality Summary
- Dominant Traits
- Emotional Style
- Thinking Style
- Decision Style
- Relationship Style
- Strengths
- Development Areas
- Growth Advice

### Recommendation Engine

Includes:

- Recommendation Summary
- Personal Growth
- Career Suggestions
- Relationship Guidance
- Goal Alignment
- Spiritual Development
- Immediate Actions
- Long-Term Actions

### Life-Trend Analysis

Includes:

- Trend Summary
- Current Theme
- Next 30 Days
- Next 3 Months
- Opportunities
- Challenges
- Recommended Focus
- Practical Actions

> Life-trend outputs are symbolic guidance and are not guaranteed predictions of future events.

### Guidance Scoring

The platform calculates prototype-oriented guidance metrics including:

- Palm Analysis Confidence
- Tarot Interpretation Relevance
- Personality Alignment
- User-Context Relevance
- Reading Consistency
- Overall Insight Score

These scores measure prototype completeness, consistency, and contextual relevance. They do not represent scientific accuracy.

### Reading History & Follow-Up Chat

- Persistent complete reading sessions
- Saved original question
- Saved palm analysis
- Saved tarot analysis
- Saved AI reading
- Saved guidance scores
- Persistent follow-up chat
- Session history browsing

### Reports

- Complete reading PDF generation
- PDF download
- Email PDF to the authenticated user's registered email address
- Reading report workflow
- Platform report features

### Notifications

- In-app notifications
- Read/unread status
- Reading-related notifications

### User Account Deletion

Users can permanently delete their own non-administrator account from the Profile page.

Deletion removes private account data including:

- User account
- Saved reading sessions
- Follow-up chat messages
- Notifications
- Password-reset records

Platform analytics may remain in anonymized form with the user relationship removed.

### Administrator User Management

Administrators can:

- View all users
- Search users
- Filter users by role
- Filter users by status
- Change user roles
- Enable or disable accounts
- Delete non-administrator user accounts
- View account statistics
- View platform reading analytics

Administrator accounts are protected from accidental deletion through user management.

---

## User Roles

The platform supports four roles:

| Role | Purpose |
|---|---|
| `user` | Standard platform user |
| `tarot_reader` | Tarot Reader dashboard and reading support |
| `spiritual_consultant` | Spiritual Consultant dashboard and guidance support |
| `administrator` | Platform administration and analytics |

Public registration creates a standard `user` account.

---

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- pwdlib / Argon2 password hashing
- PostgreSQL for production
- SQLite for local development
- Gemini AI integration
- Brevo transactional email API

### Frontend

- React
- Vite
- React Router
- Recharts
- CSS
- Responsive dashboard layout

### Deployment

- Render
- PostgreSQL production database
- Separate backend and frontend services

---

## Project Structure

```text
Palmistry_Tarot_Intelligence/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── theme.css
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│
└── README.md
```

---

## Local Development

### Prerequisites

Install:

- Python
- Node.js
- npm
- Git

### Backend Setup

Open PowerShell in the project root:

```powershell
cd A:\Palmistry_Tarot_Intelligence
```

Activate the existing virtual environment if available:

```powershell
.\venv\Scripts\Activate.ps1
```

Move into the backend:

```powershell
cd backend
```

Install dependencies if required:

```powershell
python -m pip install -r requirements.txt
```

Create/configure:

```text
backend/.env
```

Use `.env.example` as the reference.

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --port 8001
```

Local backend:

```text
http://127.0.0.1:8001
```

API documentation:

```text
http://127.0.0.1:8001/docs
```

### Frontend Setup

Open another PowerShell terminal:

```powershell
cd A:\Palmistry_Tarot_Intelligence\frontend
```

Install packages if required:

```powershell
npm install
```

Create:

```text
frontend/.env.local
```

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8001
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

Start the frontend:

```powershell
npm run dev
```

Local frontend:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend

Typical backend environment variables include:

```env
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=

GOOGLE_CLIENT_ID=

GEMINI_API_KEY=
GEMINI_MODEL=

BREVO_API_KEY=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=

PUBLIC_FRONTEND_URL=
PASSWORD_RESET_EXPIRE_MINUTES=
PASSWORD_RESET_COOLDOWN_SECONDS=
```

Do not commit production credentials or API keys into Git.

### Frontend

```env
VITE_API_BASE_URL=
VITE_GOOGLE_CLIENT_ID=
```

---

## Important API Endpoints

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/token
POST   /api/auth/google
GET    /api/auth/me
PATCH  /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
DELETE /api/auth/account
```

### Administration

```text
GET    /api/admin/overview
GET    /api/admin/users
PATCH  /api/admin/users/{user_id}/role
PATCH  /api/admin/users/{user_id}/status
DELETE /api/admin/users/{user_id}
GET    /api/admin/analytics/summary
GET    /api/admin/analytics/history
```

The backend also contains dedicated routes for readings, palm analysis, tarot, reports, analytics, notifications, personality intelligence, recommendations, life trends, guidance scoring, and follow-up chat.

---

## Account Deletion Confirmation

Permanent account deletion requires the exact confirmation value:

```json
{
  "confirmation": "DELETE"
}
```

This applies to both:

- User self-deletion
- Administrator deletion of an eligible user account

---

## Testing

From the backend folder:

```powershell
cd A:\Palmistry_Tarot_Intelligence\backend
python -m pytest -q
```

Run account-deletion tests only:

```powershell
python -m pytest tests/test_account_deletion.py -q
```

Frontend production build:

```powershell
cd A:\Palmistry_Tarot_Intelligence\frontend
npm run build
```

---

## Production Deployment

The project is deployed using Render.

### Frontend

```text
https://palmistry-tarot-frontend-ankita.onrender.com
```

### Backend

```text
https://palmistry-tarot-intelligence-platform.onrender.com
```

Production configuration is handled using Render environment variables. Secret values must never be stored directly in the repository.

---

## Security Features

The prototype includes:

- Argon2 password hashing
- JWT authentication
- Role-based access control
- Authenticated API endpoints
- Google authentication
- Generic forgot-password responses
- Secure password-reset tokens
- SHA-256 reset-token storage
- Reset-token expiration
- One-time reset-token usage
- Password-reset request cooldown
- User ownership checks for saved readings
- Administrator access restrictions
- Administrator self-protection
- Account-deletion confirmation
- Protected administrator deletion
- Registered-email-only reading PDF delivery

---

## Visual Design

The frontend uses a custom **Mystic / Celestial Intelligence** visual theme featuring:

- Midnight/navy backgrounds
- Violet and purple gradients
- Soft gold accents
- Celestial star details
- Glass-style dashboard panels
- Responsive sidebar navigation
- Dedicated role dashboards
- Responsive desktop/mobile layouts

---

## Important Disclaimer

Palmistry and tarot features in this platform are intended for:

- Entertainment
- Personal reflection
- Educational demonstration
- Software prototype evaluation

They should not be treated as scientific, medical, legal, financial, or guaranteed predictive advice.

AI-generated interpretations and life-trend outputs are symbolic and contextual rather than factual predictions.

---

## Development Status

The current prototype includes:

- Palm analysis
- Tarot engine
- AI interpretation
- Personality intelligence
- Recommendation engine
- Life-trend analysis
- Guidance scoring
- User profiles
- Authentication
- Google Sign-In
- Forgot/Reset Password
- Persistent readings
- Follow-up chat
- Notifications
- Reading reports
- PDF download
- Email PDF delivery
- Role-based dashboards
- Administrator analytics
- User and administrator account deletion
- Production deployment
- Automated backend tests
- Responsive visual theme

The application is now in the final project-polish and documentation stage.

---

## Future Improvements

Possible future extensions include:

- Additional palm lines
- Palm shape analysis
- Finger structure analysis
- Additional tarot spreads
- Reader-to-user consultation workflows
- Advanced reporting
- More detailed audit logs
- Expanded notification workflows
- Stronger observability and monitoring
- Additional automated frontend tests
- Additional deployment environments
- Mobile application support

---

## Repository

Development branch:

```text
AnkitaPagare
```

Repository:

```text
springboardmentor12233a-tech/Palmistry-Tarot-Intelligence-Platform
```

---

## Author

**Ankita Pagare**

Internship Project  
**Palmistry & Tarot Intelligence Platform**
