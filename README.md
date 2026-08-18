# Mystiq: Palmistry & Tarot Intelligence Platform

An end-to-end AI-powered spiritual intelligence platform synthesizing biometric palm line extraction, interactive 78-card tarot spreads, a deterministic 5-factor insight scoring engine, and multimodal AI guidance into executive analytics and downloadable PDF reports.

---

## Key Features

### 1. Topography of Fate (Biometric Palm Analysis Engine)
* **21-Landmark Mesh Detection:** Fits anatomical landmarks to the wrist, knuckles, fingers, and palm centroid using MediaPipe Hand Landmarker.
* **Image Normalization & CLAHE:** Uses Contrast Limited Adaptive Histogram Equalization to normalize illumination variations across diverse skin tones.
* **Frangi Vesselness & Ridge Filtering:** Isolates deep palmar creases from ambient skin textures.
* **Morphological Skeletonization:** Extracts single-pixel line centerlines to compute quantitative metrics:
  * **Heart Line:** Emotional intelligence and affective dynamics.
  * **Head Line:** Cognitive stamina, focus, and analytical depth.
  * **Life Line:** Somatic vitality, endurance, and physical resilience.
  * **Fate Line:** Vocational calling and self-determination index.
* **Palmar Mounts & Archetype Classification:** Analyzes elevation and prominence across planetary mounts (Jupiter, Saturn, Apollo, Mercury, Venus, Moon) to classify the hand into Elemental Archetypes (*Water, Air, Earth, Fire*).

### 2. Tarot Sanctum (78-Card Symbolic Engine)
* **Complete 78-Card Rider-Waite-Smith Corpus:** Full dataset of 22 Major Arcana and 56 Minor Arcana with associated elemental, astrological, and keyword mappings.
* **Interactive 3D Spread Picker:** Features a 3D animated fan/grid view allowing users to select cards based on their intent.
* **Dynamic Spread Architectures:**
  * *Single Card:* Daily Celestial Anchor
  * *Three Card:* Past / Present / Future
  * *Relationship:* Union & Resonance (4 Cards)
  * *Career:* Vocation & Prosperity Nexus (4 Cards)
  * *Life Path:* Soul Purpose & Karmic Destiny (5 Cards)
  * *Celtic Cross:* Grand Multidimensional Oracle (10 Cards)

### 3. 5-Factor Spiritual Guidance Scoring Engine
Calculates a mathematical composite index based on weighted multi-dimensional vectors:
* **Palm Confidence (30%):** Continuous skeleton pixel density, line prominence, and curvature accuracy.
* **Tarot Relevance (25%):** Upright vs. reversed ratio and Major Arcana gravity.
* **Personality Alignment (20%):** Profile archetype overlap with user-defined spiritual goals.
* **Context Relevance (15%):** Semantic alignment between the user's inquiry and drawn cards.
* **Reading Consistency (10%):** Algorithmic cross-reading harmonic stability.

### 4. Multimodal Synthesis & AI Oracle
* Integrates multimodal AI models with structured JSON schema outputs.
* Synthesizes physical palm line metrics, drawn tarot symbolism, and user context into a multi-paragraph executive reading.
* Generates evolutionary life trend timelines (Immediate, 6-12 Month, 2-5 Year), relationship guidance, career milestones, chakra energy balances, and personalized affirmations.

### 5. Multi-Page PDF & Data Export Engine
* **Vector PDF Generation:** Compiles an executive 3-page certificate report with biometric metric tables, tarot card breakdown boxes, life timeline charts, and a verification seal.
* **CSV / Excel Data Export:** Generates structured raw data downloads of all session telemetry and scoring matrices.
* **Voice Oracle:** Integrates the browser Web Speech API for interactive audio reading playback.

---

## Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Motion (`framer-motion`), Lucide Icons
* **Backend:** Express.js, Node.js (`tsx`), REST APIs
* **Computer Vision:** MediaPipe Hand Landmarker, OpenCV, Scikit-Image (`frangi`, `skeletonize`)
* **AI / NLP:** Google Gemini API (`@google/genai`), Multimodal Vision Integration
* **Authentication & Database:** Firebase Auth (Google OAuth2), Cloud Firestore, Firestore Security Rules
* **Export Modules:** `jsPDF`, Canvas-Confetti, Web Speech API

---

## Getting Started

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** / **yarn** / **bun**
* **Google Gemini API Key**
* **Firebase Project** (for Authentication & Cloud Firestore)


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
