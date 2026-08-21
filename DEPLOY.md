# Production Deployment Guide — Palmistry & Tarot Intelligence Platform Backend

This guide provides end-to-end instructions for deploying the FastAPI backend to cloud platforms such as **Railway** or **Render**, paired with a managed **PostgreSQL** database.

---

## 1. Required Environment Variables

Configure these variables in your hosting provider's dashboard (under **Variables** / **Environment**):

| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `ENVIRONMENT` | Yes | `production` | Enables production mode |
| `DEBUG` | Yes | `False` | Disables debug mode and auto-reload |
| `PORT` | Auto | Assigned by host (e.g. `8000` or `10000`) | Listening port for Uvicorn |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://user:pass@host:5432/dbname` | Async connection string used by FastAPI |
| `SYNC_DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/dbname` | Sync connection string used by Alembic |
| `GROQ_API_KEY` | Yes | `gsk_...` | API Key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Primary Groq model |
| `GROQ_FALLBACK_MODEL` | No | `llama-3.1-8b-instant` | Fallback Groq model |
| `JWT_SECRET` | Yes | Secure random string (min 32 chars) | Cryptographic secret for signing auth tokens |
| `CORS_ORIGINS` | Yes | `["https://palmistry-frontend.vercel.app","http://localhost:3000"]` | Whitelisted frontend origins (JSON array or comma-separated) |

---

## 2. Model Assets & Docker Image

The Docker build automatically runs `python scripts/download_assets.py` to bake the following assets into the container image:
- `assets/checkpoint_aug_epoch70.pth` (55 MB PyTorch UNet weights)
- `assets/hand_landmarker.task` (7.8 MB MediaPipe 21-point hand model)
- `assets/tarot-images.json` (78-card archetypal dataset)
- `assets/cards/*.jpg` (78 high-res card scans)

> Total assets size is **~65 MB**, which fits easily within standard container image limits on Railway, Render, Fly.io, and AWS ECS.

---

## 3. Database Migrations in Production

Alembic migrations are executed automatically on container startup via `docker-entrypoint.sh`:
```sh
alembic upgrade head
```

To run migrations manually via container shell / CLI:
```bash
alembic upgrade head
```

---

## 4. Deploying to Railway (Recommended)

Railway offers one-click PostgreSQL provisioning, automatic Docker builds from GitHub, and dynamic port injection.

### Step 1: Push Your Code to GitHub
1. Initialize git in `palmistry-backend` (if not already done) and push to a private or public GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial production backend"
   git branch -M main
   git remote add origin https://github.com/your-username/palmistry-backend.git
   git push -u origin main
   ```

### Step 2: Create a New Project on Railway
1. Log in to [Railway.app](https://railway.app).
2. Click **"+ New Project"** $\rightarrow$ select **"Provision PostgreSQL"**.
3. Railway will spin up a managed PostgreSQL instance and provide connection variables.

### Step 3: Deploy the FastAPI Service
1. In the same project canvas, click **"+ New"** $\rightarrow$ select **"GitHub Repo"**.
2. Select your `palmistry-backend` repository.
3. Railway will detect the `Dockerfile` and start building the container image.

### Step 4: Configure Environment Variables in Railway
1. Click on your **FastAPI backend service** in the Railway canvas.
2. Go to the **"Variables"** tab $\rightarrow$ click **"Raw Editor"** (or **"+ Add Variable"**).
3. Paste the following configuration:

```ini
ENVIRONMENT=production
DEBUG=False
GROQ_API_KEY=gsk_your_actual_groq_api_key
JWT_SECRET=super-secret-production-random-jwt-key-998877665544332211!
CORS_ORIGINS=["https://palmistry-frontend.vercel.app","http://localhost:3000"]
```

4. For the database connection, Railway provides reference variables:
   - Click **"Add Reference"** $\rightarrow$ select `DATABASE_URL` from your Postgres service.
   - For `DATABASE_URL`, set:
     ```
     postgresql+asyncpg://${{Postgres.DATABASE_URL}}
     ```
     *(Or replace `postgresql://` with `postgresql+asyncpg://`)*
   - For `SYNC_DATABASE_URL`, set:
     ```
     ${{Postgres.DATABASE_URL}}
     ```

### Step 5: Expose Public Domain & Test
1. Go to the **"Settings"** tab of your backend service.
2. Under **"Networking"**, click **"Generate Domain"** (e.g. `palmistry-backend-production.up.railway.app`).
3. Under **"Healthcheck Path"**, enter `/health`.
4. Open `https://your-backend-url.up.railway.app/docs` in your browser to verify Swagger UI.

---

## 5. Deploying to Render

### Step 1: Create a PostgreSQL Database on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **"New +"** $\rightarrow$ **"PostgreSQL"**.
3. Name: `palmistry-db`, Plan: Free / Starter $\rightarrow$ Click **"Create Database"**.
4. Copy the **"Internal Database URL"** (e.g., `postgres://user:pass@dpg-xxx:5432/palmistry_db`).

### Step 2: Create a Web Service
1. Click **"New +"** $\rightarrow$ **"Web Service"**.
2. Connect your GitHub repository `palmistry-backend`.
3. **Environment**: `Docker`
4. **Health Check Path**: `/health`

### Step 3: Add Environment Variables on Render
Go to the **"Environment"** tab of your Render Web Service and add:

| Key | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `DEBUG` | `False` |
| `GROQ_API_KEY` | `gsk_...` |
| `JWT_SECRET` | `your_secret_key` |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@dpg-xxx:5432/palmistry_db` |
| `SYNC_DATABASE_URL` | `postgresql://user:pass@dpg-xxx:5432/palmistry_db` |
| `CORS_ORIGINS` | `["https://palmistry-frontend.vercel.app","http://localhost:3000"]` |

Render will build the Docker container, run migrations, and assign a public HTTPS URL (e.g. `https://palmistry-backend.onrender.com`).

---

## 6. Updating the Frontend Configuration

Once your backend is deployed:
1. In your **Next.js frontend** (`palmistry_frontend`), open `.env.production` (or set the environment variable on Vercel):
   ```ini
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
   ```
2. Redeploy the frontend on Vercel / Netlify.
3. Your frontend will now communicate directly with your live cloud backend!

---

## 7. Verification Checklist

- [ ] `/health` returns `{"status": "healthy", ...}` (HTTP 200)
- [ ] `/docs` loads interactive Swagger UI
- [ ] `/api/auth/register` creates user and issues JWT tokens
- [ ] `/api/tarot/draw` returns cards from the 78-card deck
- [ ] `/api/palm/analyze` processes hand image biometrics
- [ ] `/api/reading/generate` executes Groq LLM synthesis and returns weighted Insight Score
- [ ] `/api/reading/{id}/export?format=pdf` downloads branded PDF report
- [ ] `/api/reading/{id}/export?format=xlsx` downloads multi-tab Excel workbook
