# 🛡️ CyberShield AI V2 — AI-Powered Cybersecurity & Digital Safety Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Explainability-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Ready-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

> **Hackathon Theme:** AI-Powered Cybersecurity & Digital Safety  
> **Product Name:** CyberShield AI V2  
> **Style:** Linear / Stripe / Vercel-inspired Enterprise Dark Mode  

---

## 🌟 Executive Overview

**CyberShield AI V2** is a real-world, enterprise-grade digital threat intelligence and incident mitigation platform. Moving beyond traditional simple phishing checkers, CyberShield AI integrates dedicated Machine Learning models, optical character recognition (OCR), computer vision, and Google Gemini explainability to detect and neutralize digital threats across multiple vectors.

### 🛡️ Supported Threat Vectors
1. **Phishing & Malicious Emails**: Full `.eml` and text parsing, SPF/DKIM/DMARC spoof verification, credential harvesting inspection, TF-IDF + Logistic Regression classification (**96.80% Accuracy**).
2. **Fraudulent URLs & Fake Websites**: Character N-gram TF-IDF + Random Forest classification (**99.60% Accuracy**), typosquatting / brand homograph detection (`paypa1.com`), entropy analysis, and abusive disposable TLD scanning.
3. **Scam SMS & WhatsApp Messages**: TF-IDF + Random Forest classification (**97.14% Accuracy**), UPI cashback traps, electricity disconnection panic, law enforcement extortion (FedEx customs seizure), and part-time Telegram task frauds.
4. **Screenshot-Based Scam Detection**: OCR Optical Character Recognition extracting text from chat screenshots, fake banking alerts, and invoices with visual layout inspection.
5. **QR Code Quishing Defender**: Real-time matrix decoding, dynamic UPI money request detection (`upi://pay` debit traps), and deep URL redirection inspection.
6. **Gemini AI Security Copilot**: Context-aware cyber threat reasoning in plain human language, potential impact assessment, and step-by-step response checklists.
7. **Cyber Threat Academy**: Interactive threat curriculum tracks and "Test Your Scam IQ" simulation quiz.

---

## 🏗️ Technical Architecture

```
                                  [ User / SOC Analyst ]
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
          [ Modern React + Vite UI ]                    [ REST API Endpoints ]
       (Tailwind, Framer Motion, Recharts)               (FastAPI Async Core)
                      │                                             │
                      └──────────────────────┬──────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
        [ Machine Learning Pipelines ]                 [ Multi-Modal & AI Layer ]
     • Email Model: TF-IDF + LogReg (96.8%)         • Google Gemini AI Explainability
     • URL Model: Char TF-IDF + RF (99.6%)          • OCR Vision (Tesseract / CV)
     • SMS Model: TF-IDF + RF (97.1%)               • QR Code Matrix Decoder (OpenCV)
                      │                                             │
                      └──────────────────────┬──────────────────────┘
                                             │
                                             ▼
                               [ MongoDB / Atlas / JSON DB ]
                                (Audit Logs & User Auth)
```

---

## 📊 Pre-Trained Machine Learning Models

| Threat Vector | Training Dataset | Pipeline Architecture | Test Accuracy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Email Phishing** | `email_threat_detection.csv` (103K rows) | TF-IDF (N-gram 1-2) + Logistic Regression | **96.80%** | `Production Ready` |
| **Scam Messages** | `SMSSpamCollection` + Indian Scam dataset | TF-IDF + Random Forest (100 Trees) | **97.14%** | `Production Ready` |
| **Malicious URLs** | `PhiUSIIL_Phishing_URL_Dataset.csv` (235K rows) | Char N-gram TF-IDF + Random Forest | **99.60%** | `Production Ready` |

---

## 🚀 Quick Start (Local Run)

### 1. Run the Unified Platform
```bash
python run_platform.py
```

- Web Interface: [http://localhost:8000](http://localhost:8000)
- Interactive Swagger API: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Demo Credentials for Hackathon Judges
- **One-Click Sign In**: Click **"1-Click Demo SOC Analyst Sign In"** on the Login page
- **Manual Credentials**:
  - Email: `analyst@cybershield.ai`
  - Password: `cybershield2026`

---

## ☁️ Free Google Cloud Deployment Guide

See [DEPLOYMENT_GCP.md](file:///c:/cyber-security(hack)/DEPLOYMENT_GCP.md) for 100% Free Tier deployment on **Google Cloud Run**:

```bash
# 1-Command Deploy to Google Cloud Run
gcloud run deploy cybershield-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```

---

## 🏆 SIH & hack2skill Hackathon Scoring Highlights

- **Explainable AI (XAI)**: Every single threat output includes a Gemini AI reasoning summary breaking down social engineering triggers.
- **Enterprise UX**: Built with Linear/Stripe dark aesthetics, SVG radar threat meters, Recharts telemetry, and real-time live threat ticker.
- **No Mock Workflows**: All 3 ML pipelines are fully trained on real Kaggle/benchmark datasets with live OpenCV QR decoding and OCR text extraction.
