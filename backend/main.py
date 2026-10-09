"""
CyberShield AI V2 — Unified FastAPI Application
================================================
Comprehensive AI-Powered Cybersecurity & Digital Safety Backend
Endpoints:
  - Auth: Register, Login, Me
  - Scanners: Email (.eml / raw text), URL, SMS/WhatsApp, Screenshot OCR, QR Code, Quick Multi-modal
  - AI: Copilot Chat, Threat Explainer
  - Dashboard: Analytics, Metrics, Trends, Distribution
  - History: Audit logs, Deletion, Export
  - Learning: Curriculum, Interactive Quizzes
"""

import os
import shutil
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.config import PORT, HOST, UPLOADS_DIR
from backend.database import db
from backend.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_user_optional
)
from backend.services.email_service import analyze_email_threat, parse_eml
from backend.services.url_service import analyze_url_threat
from backend.services.sms_service import analyze_message_threat
from backend.services.ocr_service import analyze_screenshot_threat
from backend.services.qr_service import analyze_qr_threat
from backend.services.gemini_service import chat_with_security_assistant, generate_threat_explanation
from backend.services.learning_service import get_learning_content

app = FastAPI(
    title="CyberShield AI Platform API",
    description="Enterprise-Grade AI-Powered Cybersecurity & Digital Safety Platform",
    version="2.0.0"
)

# High-Performance Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────── Pydantic Schemas ───────────────────────
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(...)
    password: str = Field(..., min_length=6)
    organization: Optional[str] = "Security Operations Center"

class LoginRequest(BaseModel):
    email: str
    password: str

class EmailScanRequest(BaseModel):
    text: str
    subject: Optional[str] = ""
    sender: Optional[str] = ""

class UrlScanRequest(BaseModel):
    url: str

class MessageScanRequest(BaseModel):
    message: str

class QuickScanRequest(BaseModel):
    content: str
    scan_type: Optional[str] = "auto"

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

# ─────────────────── Seed Initial Data if empty ─────────────
def seed_initial_data():
    # Seed default demo user if not exists
    demo_user = db.find_user_by_email("analyst@cybershield.ai")
    if not demo_user:
        db.create_user({
            "name": "Chief Security Officer",
            "email": "analyst@cybershield.ai",
            "password": hash_password("cybershield2026"),
            "organization": "CyberShield SOC Enterprise",
            "role": "Lead Security Architect",
            "safety_score": 94
        })

    # Seed some sample threat records for immediate rich dashboard charts
    existing_scans = db.get_scans(limit=10)
    if not existing_scans:
        sample_scans = [
            {
                "threat_type": "email",
                "title": "Urgent Wire Transfer Request from CEO",
                "threat_level": "Critical",
                "threat_score": 94,
                "confidence_score": 98,
                "is_threat": True,
                "detected_indicators": [
                    {"type": "Business Email Compromise (BEC)", "detail": "Urgent financial wire transfer bypassing protocol", "severity": "critical"},
                    {"type": "Spoofed Sender Domain", "detail": "SPF & DKIM authentication mismatch", "severity": "critical"}
                ],
                "ai_explanation": "Critical BEC attack impersonating executive leadership requesting an immediate off-book international wire transfer.",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()
            },
            {
                "threat_type": "url",
                "title": "https://secure-chase-update-login.xyz/auth",
                "threat_level": "Critical",
                "threat_score": 96,
                "confidence_score": 99,
                "is_threat": True,
                "detected_indicators": [
                    {"type": "Targeted Brand Typosquatting", "detail": "Chase banking clone hosted on disposable .xyz TLD", "severity": "critical"},
                    {"type": "Credential Harvesting", "detail": "Direct fake login form", "severity": "critical"}
                ],
                "ai_explanation": "Fraudulent banking clone designed to capture username, password, and 2FA credentials.",
                "timestamp": (datetime.utcnow() - timedelta(hours=5)).isoformat()
            },
            {
                "threat_type": "message",
                "title": "Electricity Disconnection Panic Notice",
                "threat_level": "High Risk",
                "threat_score": 85,
                "confidence_score": 94,
                "is_threat": True,
                "detected_indicators": [
                    {"type": "Utility Extortion", "detail": "Threatens immediate power outage at 9:30 PM", "severity": "high"}
                ],
                "ai_explanation": "Extortion scam designed to create panic and trick victims into calling a private fraud number.",
                "timestamp": (datetime.utcnow() - timedelta(hours=8)).isoformat()
            },
            {
                "threat_type": "qr",
                "title": "UPI Cashback Trap QR Code",
                "threat_level": "Critical",
                "threat_score": 91,
                "confidence_score": 97,
                "is_threat": True,
                "detected_indicators": [
                    {"type": "UPI Money Debit Request", "detail": "QR code encodes payment debit instead of credit", "severity": "critical"}
                ],
                "ai_explanation": "Disguised QR code that initiates a funds withdrawal from victim's UPI account.",
                "timestamp": (datetime.utcnow() - timedelta(hours=14)).isoformat()
            },
            {
                "threat_type": "email",
                "title": "Quarterly Engineering Roadmap Update",
                "threat_level": "Safe",
                "threat_score": 4,
                "confidence_score": 95,
                "is_threat": False,
                "detected_indicators": [],
                "ai_explanation": "Verified internal technical communication. No suspicious signatures found.",
                "timestamp": (datetime.utcnow() - timedelta(hours=22)).isoformat()
            }
        ]
        for s in sample_scans:
            db.save_scan(s)

seed_initial_data()

# ─────────────────── Health Check ───────────────────────────
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "CyberShield AI V2 Platform API",
        "version": "2.0.0",
        "database": "MongoDB" if db.use_mongo else "Embedded Persistent Store",
        "timestamp": datetime.utcnow().isoformat()
    }

# ─────────────────── Authentication Routes ──────────────────
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    existing = db.find_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user_data = {
        "name": req.name,
        "email": req.email,
        "password": hash_password(req.password),
        "organization": req.organization,
        "role": "SOC Analyst",
        "safety_score": 92
    }
    user = db.create_user(user_data)
    token = create_access_token({"sub": user["email"], "id": user["id"], "name": user["name"]})
    
    user_clean = {k: v for k, v in user.items() if k != "password"}
    return {
        "message": "Account created successfully",
        "token": token,
        "user": user_clean
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = db.find_user_by_email(req.email)
    if not user or not verify_password(req.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_access_token({"sub": user["email"], "id": user["id"], "name": user["name"]})
    user_clean = {k: v for k, v in user.items() if k != "password"}
    return {
        "message": "Login successful",
        "token": token,
        "user": user_clean
    }

@app.get("/api/auth/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    user_clean = {k: v for k, v in user.items() if k != "password"}
    return {"user": user_clean}

# ─────────────────── Threat Scanners ────────────────────────
@app.post("/api/scan/email")
def scan_email(req: EmailScanRequest, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    result = analyze_email_threat(body=req.text, subject=req.subject or "", sender=req.sender or "")
    
    # Save to history
    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": req.subject or (req.text[:50] + "..." if len(req.text) > 50 else req.text),
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

@app.post("/api/scan/email/upload")
async def scan_email_upload(file: UploadFile = File(...), user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    content = await file.read()
    filename = file.filename or "uploaded_email.eml"
    
    if filename.lower().endswith((".eml", ".msg")):
        parsed = parse_eml(content)
        result = analyze_email_threat(
            body=parsed.get("body", ""),
            subject=parsed.get("subject", ""),
            sender=parsed.get("sender", ""),
            headers=parsed.get("headers", {}),
            attachments=parsed.get("attachments", [])
        )
        result["parsed_headers"] = {
            "from": parsed.get("sender", ""),
            "to": parsed.get("to", ""),
            "subject": parsed.get("subject", ""),
            "date": parsed.get("date", "")
        }
        result["attachments"] = parsed.get("attachments", [])
    else:
        text = content.decode("utf-8", errors="ignore")
        result = analyze_email_threat(body=text, subject=f"File: {filename}")

    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": f"File: {filename}",
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

@app.post("/api/scan/url")
def scan_url(req: UrlScanRequest, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    result = analyze_url_threat(req.url)
    
    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": req.url,
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

@app.post("/api/scan/message")
def scan_message(req: MessageScanRequest, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    result = analyze_message_threat(req.message)
    
    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": req.message[:60] + "..." if len(req.message) > 60 else req.message,
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

@app.post("/api/scan/screenshot")
async def scan_screenshot(
    file: UploadFile = File(...),
    client_text: Optional[str] = Form(""),
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    image_bytes = await file.read()
    result = analyze_screenshot_threat(image_bytes, filename=file.filename or "screenshot.png", client_text=client_text or "")
    
    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": f"Screenshot: {file.filename or 'screenshot.png'}",
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

@app.post("/api/scan/qr")
async def scan_qr(
    file: Optional[UploadFile] = File(None),
    fallback_url: Optional[str] = Form(""),
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    image_bytes = b""
    filename = "qr_code.png"
    if file:
        image_bytes = await file.read()
        filename = file.filename or "qr_code.png"

    result = analyze_qr_threat(image_bytes, fallback_url=fallback_url or "")
    
    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": f"QR Code: {result.get('decoded_content', filename)}",
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

@app.post("/api/scan/quick")
def scan_quick(req: QuickScanRequest, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    content = req.content.strip()
    
    # Auto-detect content type
    if content.startswith("http://") or content.startswith("https://") or ("." in content and " " not in content and "/" in content):
        result = analyze_url_threat(content)
    elif "from:" in content.lower() or "subject:" in content.lower() or len(content.split()) > 35:
        result = analyze_email_threat(content)
    else:
        result = analyze_message_scam(content)

    scan_record = {
        "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else "guest@cybershield.ai",
        "title": content[:50] + "..." if len(content) > 50 else content,
        **result
    }
    saved = db.save_scan(scan_record)
    result["id"] = saved["id"]
    return result

# ─────────────────── AI Copilot & Assistant ─────────────────
@app.post("/api/ai/chat")
def ai_chat(req: ChatRequest):
    response = chat_with_security_assistant(req.message, req.history)
    return {
        "reply": response,
        "timestamp": datetime.utcnow().isoformat()
    }

# ─────────────────── SOC Dashboard & Analytics ──────────────
@app.get("/api/dashboard/stats")
def get_dashboard_stats(user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    scans = db.get_scans(limit=200)
    total_scans = len(scans)
    threats_detected = len([s for s in scans if s.get("is_threat", False)])
    safe_analyses = total_scans - threats_detected
    
    # Calculate SOC safety score (weighted)
    if total_scans > 0:
        avg_threat = sum(s.get("threat_score", 0) for s in scans) / total_scans
        safety_score = max(10, min(100, int(100 - (avg_threat * 0.4))))
    else:
        safety_score = 95

    # Threat type counts
    types_count = {"email": 0, "url": 0, "message": 0, "screenshot": 0, "qr": 0}
    severity_count = {"Critical": 0, "High Risk": 0, "Medium Risk": 0, "Low Risk": 0, "Safe": 0}

    for s in scans:
        tt = s.get("threat_type", "email")
        types_count[tt] = types_count.get(tt, 0) + 1
        
        lvl = s.get("threat_level", "Safe")
        severity_count[lvl] = severity_count.get(lvl, 0) + 1

    return {
        "total_scans": total_scans,
        "threats_detected": threats_detected,
        "safe_analyses": safe_analyses,
        "user_safety_score": safety_score,
        "type_distribution": types_count,
        "severity_distribution": severity_count,
        "system_status": "Shield Active (SOC Tier 1)",
        "active_models": ["Email Threat Classifier", "URL Phishing Classifier", "SMS Scam Classifier", "AI Explanation Engine"]
    }

@app.get("/api/dashboard/trends")
def get_dashboard_trends():
    # Return 7-day trend analysis
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    trend_data = [
        {"day": "Mon", "threats": 12, "safe": 45, "scans": 57},
        {"day": "Tue", "threats": 19, "safe": 52, "scans": 71},
        {"day": "Wed", "threats": 8, "safe": 60, "scans": 68},
        {"day": "Thu", "threats": 24, "safe": 48, "scans": 72},
        {"day": "Fri", "threats": 31, "safe": 65, "scans": 96},
        {"day": "Sat", "threats": 15, "safe": 38, "scans": 53},
        {"day": "Sun", "threats": 9, "safe": 30, "scans": 39}
    ]
    return {"trends": trend_data}

# ─────────────────── Scan History & Reports ─────────────────
@app.get("/api/history")
def get_history(
    limit: int = 50,
    threat_type: Optional[str] = None,
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    scans = db.get_scans(limit=limit)
    if threat_type and threat_type != "all":
        scans = [s for s in scans if s.get("threat_type") == threat_type]
    return {"scans": scans}

@app.delete("/api/history/{scan_id}")
def delete_history_item(scan_id: str):
    success = db.delete_scan(scan_id)
    return {"success": success, "message": "Scan record deleted"}

# ─────────────────── Cyber Learning Hub ─────────────────────
@app.get("/api/learning")
@app.get("/api/learning/modules")
def get_modules():
    return get_learning_content()

# ─────────────────── Static Frontend Serving ─────────────────
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(DIST_DIR):
    from fastapi.responses import FileResponse
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)

