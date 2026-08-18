# AI Palmistry & Tarot Intelligence Platform 🔮✋

[![CI Pipeline](https://github.com/your-username/Palmistry-Tarot-Intelligence-Platform/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/Palmistry-Tarot-Intelligence-Platform/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.24+-FF4B4B.svg?style=flat&logo=streamlit)](https://streamlit.io)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

Production-grade, deployable application for Milestone 4 of the Capstone Project. This platform combines MediaPipe hand landmarker feature extraction, scikit-learn PCA/KMeans clustering, PyTorch UNet palm line segmentation, geometric rule interpretation, Tarot deck drawing, OpenAI narrative synthesis, and ReportLab PDF compilation into an API and Streamlit executive dashboard.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([User / Web Client]) --> Dashboard[Streamlit Dashboard :8501]
    User --> FastAPI[FastAPI Backend :8000]
    Dashboard --> FastAPI

    subgraph Core Engine [palmtarot Package]
        FastAPI --> Pipeline[pipeline.py Orchestrator]
        Pipeline --> MediaPipe[features/landmarks.py<br/>MediaPipe Landmarker + 3D Distances]
        Pipeline --> Cluster[clustering/model.py<br/>PCA + 5-Cluster KMeans]
        Pipeline --> PalmRules[palm_engine/rules.py<br/>Geometric Interpretation Rules]
        Pipeline --> UNet[palm_engine/segmentation.py<br/>PyTorch UNet Line Segmentation]
        Pipeline --> Tarot[tarot_engine/deck.py<br/>78-Card Shuffle & Draw]
        Pipeline --> LLM[llm/client.py<br/>OpenAI Narrative Synthesis]
        Pipeline --> PDF[report/pdf_generator.py<br/>ReportLab PDF Generator]
    end

    PDF --> StaticPDF[/output/Palmistry_AI_Report.pdf/]
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.10 or higher
- Git

### Installation

1. **Clone repository & enter directory:**
   ```bash
   git clone https://github.com/your-username/Palmistry-Tarot-Intelligence-Platform.git
   cd "Palmistry Tarot Intelligence Platform"
   ```

2. **Create virtual environment & activate:**
   ```bash
   python -m venv venv
   source venv/bin/activate        # Linux/macOS
   venv\Scripts\activate           # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables Configuration:**
   Copy `.env.example` to `.env` and populate your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set `OPENAI_API_KEY=your_actual_key`.*

---

## 🚀 Running the Application

1. **Start FastAPI Backend:**
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *API Swagger documentation will be available at `http://localhost:8000/docs`.*

2. **Start Streamlit Dashboard (in a second terminal):**
   ```bash
   python -m streamlit run dashboard/app.py --server.port 8501 --server.headless true
   ```
   *Dashboard will open at `http://localhost:8501`.*

---

## 🧪 Running Tests & Validation

Run the complete unit and integration test suite:

```bash
python -m pytest
```

Generate HTML coverage report:
```bash
pytest --cov=palmtarot --cov=app --cov-report=html
```

---

## 📡 REST API Reference

| Endpoint | Method | Input | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Liveness and readiness health check |
| `/analyze/palm` | `POST` | `file` (Image) | Returns 21 landmarks, 8 engineered features, cluster assignment, and rule report |
| `/analyze/tarot` | `POST` | JSON (`num_cards`) | Draws N tarot cards with orientation, light/shadow meanings, and positions |
| `/reading/full` | `POST` | `file` + Form data | Executes integrated pipeline (Palm + Tarot + LLM + PDF URL) |
| `/pdf/{filename}`| `GET` | Path | Downloads generated PDF reading report |

---

## ⚠️ Known Limitations & Future Work

1. **MediaPipe Hand Detection**: Performance depends on hand orientation, lighting, and background contrast. Extreme angles might trigger standard fallback hand geometry.
2. **UNet Model Weights**: Runs CPU inference in default server deployment; GPU acceleration recommended for batch high-throughput enterprise processing.
3. **LLM API Rate Limits**: OpenAI API calls are rate-limited; fallback narrative handles offline or API quota exhaustion scenarios gracefully.

