# AI Palmistry & Tarot Intelligence Platform

An AI-powered platform that analyzes palm images and tarot card draws to generate personalized spiritual insights — combining computer vision, deep learning, and LLM-based interpretation into a single, exportable reading report.

Built as part of the **Infosys Springboard Internship** program.

## Overview

This project takes a palm photo and a drawn tarot spread, and produces a complete, personalized reading covering personality traits, life trends, and guidance — delivered as a single downloadable PDF.

## Features

- **Palm Analysis Engine** — detects real Heart, Head, and Life lines from a palm image using a deep-learning model (U-Net), achieving a measured 91.3% success rate across real dataset images
- **Tarot Intelligence Engine** — draws a 3-card Past/Present/Future spread from a 78-card deck (22 Major Arcana, 56 Minor Arcana), with upright/reversed orientation and real card artwork
- **AI Interpretation Engine** — uses an LLM (Groq, `llama-3.3-70b-versatile`) to synthesize palm and tarot data into one coherent, personalized narrative
- **Personality Intelligence Module** — extracts structured personality traits, strengths, and growth areas
- **Recommendation Engine** — generates personal growth, relationship, career, and goal-alignment suggestions
- **Life Trend Analysis** — identifies life path themes, opportunities, and challenges
- **Combined PDF Reports** — every reading is exported as a single polished PDF with palm results, tarot card images, and full AI-generated insights

## Tech Stack

- **Palm Detection:** Python, PyTorch (U-Net), MediaPipe Tasks API, OpenCV, scikit-image
- **Tarot Engine:** Python, Pandas
- **AI Interpretation:** Groq API
- **Reports:** fpdf2, Pillow
- **Environment:** Google Colab, Google Drive

## Milestones

| Milestone | Focus | Status |
|---|---|---|
| 1 | Project setup, EDA, hand landmark extraction | ✅ Complete |
| 2 | Palm Analysis Engine, Tarot Intelligence Engine, Reading Reports | ✅ Complete |
| 3 | AI Interpretation Engine, Personality Module, Recommendation Engine, Life Trend Analysis | ✅ Complete |
| 4 | Dashboard & Analytics, Frontend/Backend Integration, Deployment | 🔲 In Progress |

## Repository Contents

- Notebooks — palm detection, tarot engine, and AI interpretation pipeline (Google Colab)
- Sample reading reports (PDF)
- Milestone documentation

## Notes

- The palm-line detection model (`yeonsumia/palmistry`, Apache-2.0 licensed) was adapted with compatibility patches for current MediaPipe/OpenCV versions.
- This project is for educational and demonstrative purposes as part of a spiritual/wellness intelligence platform concept — readings are generated for engagement and self-reflection, not as professional advice.
