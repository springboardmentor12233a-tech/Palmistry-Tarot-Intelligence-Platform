# Technical Architecture Document 📐

## 1. System Overview

The **AI Palmistry & Tarot Intelligence Platform** is a multi-modal computer vision and artificial intelligence system. It combines MediaPipe hand landmarker extraction, 3D distance feature engineering, scikit-learn PCA/KMeans clustering, PyTorch UNet palm line segmentation, rule-based interpretation engines, tarot card shuffling algorithms, OpenAI large language model narrative synthesis, and ReportLab PDF document compilation.

---

## 2. End-to-End Dataflow Diagram

```
[Raw Hand Image (.jpg/.png)] ──► [FastAPI /analyze/palm or /reading/full]
                                      │
                                      ▼
                        [palmtarot.features.landmarks]
                        ├── Detect 21 3D Landmarks (x,y,z)
                        └── Compute 8 Distance Features
                                      │
                                      ├──► [palmtarot.clustering.model]
                                      │    ├── Scale Features (StandardScaler)
                                      │    ├── Reduce Dim (2D PCA)
                                      │    └── Assign Cluster ID (5-Cluster KMeans)
                                      │
                                      ├──► [palmtarot.palm_engine.rules]
                                      │    └── Rule Interpretations (interpret_palm_width, etc.)
                                      │
                                      └──► [palmtarot.palm_engine.segmentation]
                                           ├── Crop & Resize Palm ROI (512x512)
                                           ├── PyTorch UNet Binary Mask Prediction (256x256)
                                           └── Contour Extraction (Heart, Head, Life lines)
                                      │
[Tarot Request (1 or 3 cards)] ───────┼──► [palmtarot.tarot_engine.deck]
                                      │    ├── Shuffle Deck
                                      │    ├── Select Cards & Orientation (Upright/Reversed)
                                      │    └── Extract Light / Shadow Meanings & Position
                                      │
                                      ▼
                        [palmtarot.llm.client]
                        ├── Construct Structured System & User Prompt
                        └── Call OpenAI Chat Completions API (JSON Mode)
                                      │
                                      ▼
                        [palmtarot.report.pdf_generator]
                        └── Compile Platypus PDF Document -> Output File
```

---

## 3. Package Architecture & Responsibilities

| Module | Core Responsibility | Key Classes / Functions |
| :--- | :--- | :--- |
| `palmtarot.config` | Centralized configuration, environment variable resolution, file paths | `settings` (Pydantic BaseSettings) |
| `palmtarot.data` | Dataset loading (`HandInfo.csv`, `tarot-images.json`) & EDA aggregation | `load_hand_info`, `load_tarot_json`, `get_hand_demographics` |
| `palmtarot.features` | MediaPipe 21 landmark extraction & 3D Euclidean distances | `calculate_distance`, `extract_landmark_features`, `LandmarkExtractor` |
| `palmtarot.clustering` | 2D PCA dimensionality reduction & 5-cluster KMeans model | `PalmClusterPipeline` |
| `palmtarot.palm_engine` | PyTorch UNet segmentation, ROI preprocessing, contour line extraction & rules | `UNet`, `PalmSegmenter`, `interpret_palm_width`, `generate_palm_rule_report` |
| `palmtarot.tarot_engine` | 78-card deck shuffling, orientation assignment, position mapping | `TarotDeck` |
| `palmtarot.llm` | OpenAI API client, structured JSON output validation, fallback generator | `LLMInterpreter` |
| `palmtarot.report` | ReportLab platypus PDF report generator | `generate_pdf_report` |
| `palmtarot.pipeline` | Master orchestrator linking all components | `PalmTarotPipeline` |

---

## 4. API & Dashboard Integration Model

```
                    ┌─────────────────────────┐
                    │ Streamlit Dashboard UI  │
                    │   (dashboard/app.py)    │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           │ HTTP POST Multipart / JSON (or Direct Import)│
           ▼                                           ▼
┌─────────────────────────┐                 ┌─────────────────────────┐
│     FastAPI App         │                 │ Core palmtarot Package  │
│    (app/main.py)        ├────────────────►│      (pipeline.py)      │
└─────────────────────────┘                 └─────────────────────────┘
```

The Streamlit dashboard can either invoke the core pipeline via direct Python module imports (`get_pipeline()`) or make HTTP POST calls to the FastAPI microservice endpoints (`/analyze/palm`, `/analyze/tarot`, `/reading/full`).

---

## 5. Resilience & Fallback Design

1. **Missing MediaPipe Landmark Detection**: If MediaPipe fails to detect a hand in an uploaded image, `LandmarkExtractor` supplies standard normalized hand geometry so downstream features do not throw zero-division exceptions.
2. **Missing UNet PyTorch Model Weights**: If pre-trained PyTorch weight checkpoints are missing on startup, `PalmSegmenter` seamlessly falls back to CLAHE + BlackHat morphological line extraction.
3. **OpenAI API Unavailability / Rate Limits**: If `OPENAI_API_KEY` is not provided or the network request fails, `LLMInterpreter` generates a structured, domain-accurate fallback narrative matching the JSON schema.
