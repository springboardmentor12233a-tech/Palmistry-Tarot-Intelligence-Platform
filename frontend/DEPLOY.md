# Frontend Deployment Guide — Palmistry & Tarot Intelligence Platform

This guide walks you through deploying the Next.js frontend to **Vercel** and connecting it to your deployed FastAPI backend.

---

## 1. Required Environment Variables

When deploying to Vercel, set the following environment variable in your project settings:

| Variable Name | Required | Example Production Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://palmistry-backend-production.up.railway.app` | The public HTTPS URL of your deployed FastAPI backend (e.g. from Railway or Render) |
| `NEXT_PUBLIC_APP_NAME` | No | `Palmistry & Tarot Intelligence Platform` | Brand display title |
| `NEXT_PUBLIC_APP_TAGLINE` | No | `Synthesizing Biometric Palmistry and Archetypal Tarot into Unified Cosmic Intelligence` | Tagline |

> **Note**: Do not include a trailing slash on `NEXT_PUBLIC_API_URL`.

---

## 2. Pre-Deployment Verification

Verify that your project builds cleanly without linting or type errors before pushing:

```bash
npm run build
```

---

## 3. Step-by-Step Vercel Deployment

### Step 1: Push Code to GitHub
1. Make sure your latest frontend changes are committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "feat: production frontend ready for Vercel deployment"
   git push origin main
   ```

### Step 2: Import Project on Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your **`palmistry_frontend`** repository from your GitHub account and click **"Import"**.

### Step 3: Configure Project Settings on Vercel
1. **Framework Preset**: `Next.js` (automatically detected).
2. **Root Directory**: `./` (or select `palmistry_frontend` if deploying from a monorepo).
3. **Build Command**: `npm run build` (default).
4. **Output Directory**: `.next` (default).

### Step 4: Set Environment Variables on Vercel
Under the **"Environment Variables"** accordion:
1. **Key**: `NEXT_PUBLIC_API_URL`
2. **Value**: `https://your-backend-url.up.railway.app` *(or your Render backend URL)*
3. Select environments: **Production**, **Preview**, **Development**.
4. Click **"Add"**.

### Step 5: Deploy!
1. Click **"Deploy"**.
2. Vercel will build the Next.js application and assign a live URL (e.g., `https://palmistry-frontend.vercel.app`).

---

## 4. Post-Deployment Cross-Origin Whitelisting

Make sure your backend's `CORS_ORIGINS` includes your new Vercel domain:
1. In your **Railway / Render Backend Dashboard**:
2. Update `CORS_ORIGINS`:
   ```ini
   CORS_ORIGINS=["https://palmistry-frontend.vercel.app","http://localhost:3000"]
   ```
3. Restart/redeploy the backend.

---

## 5. Verification Checklist

- [ ] Homepage (`/`) loads smoothly with celestial animations
- [ ] User registration (`/register`) and login (`/login`) create authenticated sessions
- [ ] Palm scan upload (`/reading`) triggers UNet segmentation and biometric line detection
- [ ] Tarot draw (`/reading`) renders 78-card cards with upright/reversed orientations
- [ ] AI Synthesis generates the complete narrative, personality archetypes, life trends, and Insight Score
- [ ] PDF and Excel export buttons stream reports directly from the live backend
- [ ] Reading history in user profile (`/profile`) shows all previous readings
