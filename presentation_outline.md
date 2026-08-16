# Capstone Presentation Outline: AI Palmistry & Tarot Intelligence Platform 🔮✋

**Milestone 4 Presentation — Analytics, Testing & Deployment**

---

## Slide 1: Title Slide & Project Overview
- **Title**: AI Palmistry & Tarot Intelligence Platform
- **Subtitle**: A Production-Grade Multi-Modal AI System for Palm Feature Analysis & Tarot Narrative Synthesis
- **Presenter**: Capstone Project Team
- **Key Message**: Transitioning experimental notebook pipelines into a deployable, scalable FastAPI backend and executive Streamlit dashboard.

---

## Slide 2: Problem Statement & Motivation
- **Problem**:
  - Traditional palmistry and tarot interpretations suffer from subjective variance and lack structured geometric measurement.
  - Initial ML codebases existed as fragmented Jupyter/Colab notebooks with hardcoded Kaggle paths, manual downloads, and no tests or deployment framework.
- **Solution**:
  - Engineered an end-to-end production architecture wrapping 3D MediaPipe landmark distance calculation, 5-cluster KMeans feature topology, PyTorch UNet palm line segmentation, rule-based interpretations, OpenAI narrative synthesis, and PDF generation into containerized microservices.

---

## Slide 3: Multi-Modal Data Sources & EDA Insights
- **Hand & Palm Images Dataset**:
  - `HandInfo.csv`: 11,000+ hand records containing age distributions, gender ratios, skin color classifications, and aspect of hand tags.
  - Resolution & brightness analysis confirmed uniform palm orientation suitable for ROI cropping.
- **Tarot JSON Dataset**:
  - 78 cards across Major and Minor Arcana (Wands, Cups, Swords, Pentacles).
  - Column-level breakdown of light/shadow meanings, fortune statements, affirmations, and reflection questions.

---

## Slide 4: System Architecture & Data Flow
- **Modular Package Structure (`palmtarot`)**:
  - Clean separation into `data/`, `features/`, `clustering/`, `palm_engine/`, `tarot_engine/`, `llm/`, `report/`, and `pipeline.py`.
- **End-to-End Execution Flow**:
  1. Image Input $\rightarrow$ MediaPipe 21 Hand Landmarks $\rightarrow$ 8 Engineered 3D Distance Features.
  2. Features $\rightarrow$ StandardScaler $\rightarrow$ 2D PCA $\rightarrow$ 5-Cluster KMeans Prediction.
  3. ROI Preprocessing $\rightarrow$ PyTorch UNet Inference $\rightarrow$ Heart/Head/Life Contour Extraction.
  4. 78-Card Deck Shuffle $\rightarrow$ Upright/Reversed Draw $\rightarrow$ Meaning Mapping.
  5. Structured LLM Narrative Generation $\rightarrow$ ReportLab PDF Build.

---

## Slide 5: Computer Vision & Palm Segmentation Engine
- **MediaPipe Landmarker**:
  - Extracts normalized 3D coordinates ($x, y, z$).
  - Features: Palm Width ($P_5 \leftrightarrow P_{17}$), Palm Height ($P_0 \leftrightarrow P_9$), finger lengths, and Aspect Ratio ($H/W$).
- **PyTorch UNet Model**:
  - 3 RGB input channels $\rightarrow$ $256 \times 256$ input tensor $\rightarrow$ Sigmoid probability threshold ($>0.5$) $\rightarrow$ Binary line mask.
  - Morphological BlackHat filtering and contour tracking for Heart, Head, and Life lines.

---

## Slide 6: Clustering & Feature Topology
- **PCA Dimensionality Reduction**:
  - Reduces 8 geometric features to 2 principal components for 2D spatial projection.
- **KMeans Clustering ($k=5$)**:
  - Clusters hands into distinct physical topological profiles (e.g., Short-Square, Long-Rectangular, Dominant Middle Finger).
  - Summary centroid statistics used for population-level palmistry distribution analysis.

---

## Slide 7: Executive Dashboard Walkthrough
- **Tab 1: Executive Overview**:
  - Real-time KPI metrics (Total Readings, Image Count, Model Latency, Pipeline Success Rate).
  - Interactive Plotly demographics and cluster breakdown charts.
- **Tab 2: Palm Analytics**:
  - 2D PCA cluster scatter plot, metric distribution histograms, cluster centroid tables.
- **Tab 3: Tarot Analytics**:
  - Arcana pie chart, suit bar distributions, upright vs. reversed draw balance.
- **Tab 4: Live Demo**:
  - Drag-and-drop image upload, tarot card slider, real-time pipeline execution, segmented palm mask overlay, narrative report, and instant PDF download button.

---

## Slide 8: Backend API & Error Handling
- **FastAPI Endpoints**:
  - `GET /health` — Microservice liveness/readiness monitor.
  - `POST /analyze/palm` — Extracts landmarks, engineered features, cluster ID, and rule report.
  - `POST /analyze/tarot` — Draws $N$ cards with upright/reversed orientations and light/shadow meanings.
  - `POST /reading/full` — Triggers complete integrated pipeline and returns JSON + PDF link.
- **Production Guardrails**:
  - Pydantic schema validation, strict file format (`.jpg`, `.png`) and file size ($<10\text{MB}$) checks, structured logging, and fallback exception handling.

---

## Slide 9: Testing, CI/CD & Cloud Deployment
- **Testing Suite (`pytest`)**:
  - Unit tests for distance math, geometric rule boundaries, tarot deck shuffle, PCA/KMeans fitting, and PDF creation.
  - Integration tests for FastAPI endpoints with mocked OpenAI client calls.
- **Containerization & CI/CD**:
  - Multi-stage `Dockerfile.api` and `Dockerfile.dashboard`.
  - Orchestrated via `docker-compose.yml`.
  - GitHub Actions CI workflow automates testing and Docker build verification on push.
- **Cloud Target**:
  - Ready for Google Cloud Run / Render container deployment.

---

## Slide 10: Demo Walkthrough Script
1. Open Streamlit Dashboard (`http://localhost:8501`).
2. Navigate to **Executive Overview** to inspect live performance KPIs and demographic distributions.
3. Switch to **Palm Analytics** tab to show the 2D PCA cluster scatter plot.
4. Click on **Live Reading Demo**, upload a sample hand image (or use synthetic image), select 3 tarot cards, enter a question, and click **Generate Full AI Reading**.
5. Inspect the live segmented palm overlay image, tarot card draw meanings, structured AI narrative, and click **Download PDF Reading Report**.

---

## Slide 11: Results, Limitations & Future Work
- **Results**: Delivered a fully containerized, tested, and documented multi-modal capstone platform for Milestone 4.
- **Known Limitations**:
  - MediaPipe landmark accuracy varies under extreme lighting conditions.
  - Default container deployment uses CPU inference for PyTorch UNet.
- **Future Enhancements**:
  - GPU-accelerated batch inference endpoints.
  - Fine-tuning a domain-specific LLM on classical palmistry texts.
  - Mobile iOS/Android app integration via OpenAPI/Swagger client generation.
