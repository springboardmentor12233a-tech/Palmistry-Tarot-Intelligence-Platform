# Palmistry & Tarot Intelligence Platform

A production-ready full-stack divination platform: biometric palm segmentation, an
interactive tarot engine, multimodal AI synthesis, and one-click PDF reports.

- **Frontend** — React 19 + TypeScript + Tailwind CSS v4 + TanStack Start (SSR)
- **Backend** — Lovable Cloud (Postgres, Auth, Storage) + TanStack server functions
- **AI** — Google Gemini via the Lovable AI Gateway (vision landmarks + reading synthesis)

---

## 1. Features

| Area | What ships |
| --- | --- |
| Auth | Email/password, Google sign-in, password reset (`/reset-password`), guest preview |
| Dashboard | Saved readings, spreads, palm history, per-reading PDF export, delete |
| Palm engine | Drag & drop / camera capture, 21 landmarks `P0–P20`, heart (cyan) / head (green) / life (coral) line overlays, `R_aspect = ‖P0−P9‖ / ‖P9−P12‖`, Fire/Earth/Air/Water archetypes |
| Tarot engine | Full 78-card deck, reversals, flip animations, single card and Past/Present/Future spread |
| AI synthesis | Palm metrics + drawn cards fused into one payload; light vs. shadow meanings per position |
| Reporting | Styled navy/gold PDF export, latency benchmark panel (landmarks < 500 ms, inference < 2000 ms) |

## 2. Environment configuration

On Lovable, all variables below are provisioned automatically — `.env` is managed for you
and `LOVABLE_API_KEY` (Gemini access) is already stored as a server secret.

For a local clone outside Lovable, create `.env`:

```bash
# Client (browser-visible)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Server-only (never prefix these with VITE_)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# AI gateway key used by src/lib/ai-gateway.server.ts
LOVABLE_API_KEY=<gateway-key>
```

> If you prefer to call Google's API directly instead of the gateway, swap the
> `callGemini` implementation in `src/lib/ai-gateway.server.ts` to use
> `GEMINI_API_KEY` and `https://generativelanguage.googleapis.com`. Keep the key
> server-side — never expose it as `VITE_GEMINI_API_KEY`.

## 3. Install & run

```bash
npm install       # or: bun install
npm run dev       # http://localhost:8080
npm run build     # production build
npm run preview   # serve the production build
npm run lint      # eslint
```

## 4. Backend & storage initialization

Already applied in this project; reproduce elsewhere with these steps.

**Database schema**

- `public.profiles` — `id` (references the auth user), `display_name`, `avatar_url`, timestamps.
  Auto-created on sign-up by an `on_auth_user_created` trigger.
- `public.readings` — `user_id`, `title`, `mode`, `hand_archetype`, `aspect_ratio`,
  `palm_data` (landmarks + lines), `tarot_cards`, `interpretation`, `image_path`,
  `metrics`, timestamps.

Both tables have row-level security enabled with a single owner policy
(`auth.uid() = user_id`), plus `GRANT SELECT, INSERT, UPDATE, DELETE … TO authenticated`
and `GRANT ALL … TO service_role`.

**Storage**

- Private bucket `palm-images`.
- Objects are written to `<user-id>/<timestamp>.jpg`; policies on `storage.objects`
  allow read/insert/delete only when the first path folder equals `auth.uid()`.
- The dashboard reads images through 1-hour signed URLs.

## 5. Architecture map

```
src/
  routes/
    index.tsx                    marketing landing
    auth.tsx                     sign in / sign up / reset / Google
    reset-password.tsx           recovery form
    studio.tsx                   palm scan + tarot draw + synthesis + export
    _authenticated/route.tsx     client-side auth gate
    _authenticated/dashboard.tsx saved readings archive
  lib/
    ai.functions.ts              server fns: analyzePalm, synthesizeReading
    ai-gateway.server.ts         Gemini gateway client (server-only)
    readings.functions.ts        server fns: save / list / delete readings
    palm.ts                      landmarks, R_aspect, archetype classification
    tarot.ts                     78-card deck, spreads, draw logic
    pdf.ts                       jsPDF report generator
  components/                    PalmUploader, PalmOverlay, TarotCardView, MetricsPanel, ReadingReport
```

## 6. Deploying

Use **Publish** in Lovable. For self-hosting, `npm run build` emits a
Nitro/edge-compatible server bundle; deploy it with the environment variables from
section 2 configured as server secrets.

---

Readings are for reflection and entertainment only — not medical, legal, or financial advice.
