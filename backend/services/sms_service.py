import os
import re
import string
import joblib
from typing import Dict, Any, List
from backend.config import MODELS_DIR, FALLBACK_MODELS_DIR

_sms_artifact = None

def get_sms_artifact():
    global _sms_artifact
    if _sms_artifact is None:
        candidates = [
            os.path.join(MODELS_DIR, "sms_scam_model.pkl"),
            os.path.join(MODELS_DIR, "sms_scam_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "sms_scam_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "sms_scam_model.pkl")
        ]
        for p in candidates:
            if os.path.exists(p):
                try:
                    _sms_artifact = joblib.load(p)
                    print(f"[ML] SMS model loaded from {p}")
                    break
                except Exception as e:
                    print(f"[ML] Warning loading {p}: {e}")
    return _sms_artifact

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+", " http_link ", text)
    text = re.sub(r"www\.\S+", " http_link ", text)
    text = re.sub(r"\d+", " ", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text)
    return text.strip()

SCAM_PATTERNS = [
    {
        "name": "UPI & Payment Cashback Fraud",
        "keywords": ["cashback", "phonepe", "gpay", "paytm", "send rs", "receive rs", "scan qr", "pin to receive", "reward point", "voucher claim"],
        "severity": "critical",
        "explanation": "Scammers prompt targets to scan QR codes or enter UPI PINs to receive fake cashbacks. Entering a UPI PIN always debits money."
    },
    {
        "name": "Urgent Utility Disconnection Scam",
        "keywords": ["electricity", "power disconnect", "unpaid bill", "tonight 9:30", "call officer", "meter update", "bijli"],
        "severity": "critical",
        "explanation": "Threatens immediate power disconnection to create artificial panic and trick victims into calling a fraudulent number."
    },
    {
        "name": "Banking & KYC Block Alert",
        "keywords": ["kyc", "account blocked", "sbi", "hdfc", "icici", "pan card", "card suspended", "deactivation", "yono"],
        "severity": "critical",
        "explanation": "Impersonates recognized banks claiming accounts or cards are blocked, demanding immediate document upload on phishing links."
    },
    {
        "name": "Fake Job & Task / Telegram Scam",
        "keywords": ["part-time job", "earn daily", "like youtube", "work from home", "telegram link", "t.me/", "daily income", "kamaye"],
        "severity": "high",
        "explanation": "Promises unrealistic daily income for liking videos, eventually leading to upfront deposit extortion in Telegram task scams."
    },
    {
        "name": "Law Enforcement & Customs Parcel Extortion",
        "keywords": ["fedex", "customs", "contraband", "drugs", "police", "arrest warrant", "cyber cell", "parcel seized", "narcotics"],
        "severity": "critical",
        "explanation": "Extortion scam claiming a courier in your name contains illegal substances, demanding urgent money transfers to settle investigations."
    },
    {
        "name": "Lottery & Prize Notification",
        "keywords": ["won", "lottery", "crorepati", "winner", "congratulations", "claim prize", "jackpot", "kbc"],
        "severity": "high",
        "explanation": "Advance-fee fraud notifying victims of non-existent lottery winnings to extract processing fees or banking credentials."
    }
]

def analyze_message_scam(text: str) -> Dict[str, Any]:
    text_clean = text.strip()
    text_lower = text_clean.lower()
    
    indicators = []
    risk_points = 0
    matched_categories = []

    for pattern in SCAM_PATTERNS:
        matched_kws = [kw for kw in pattern["keywords"] if kw in text_lower]
        if matched_kws:
            matched_categories.append(pattern["name"])
            indicators.append({
                "type": pattern["name"],
                "detail": f"Contains trigger terms: {', '.join(matched_kws[:3])}. {pattern['explanation']}",
                "severity": pattern["severity"]
            })
            risk_points += 35 if pattern["severity"] == "critical" else 25

    # Direct phone numbers
    phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b'
    matched_phones = re.findall(phone_pattern, text_clean)
    if matched_phones and risk_points > 0:
        indicators.append({
            "type": "Direct Unverified Contact Trap",
            "detail": f"Directs target to private unverified phone numbers ({matched_phones[0]})",
            "severity": "high"
        })
        risk_points += 15

    # External links
    url_pattern = r'https?://\S+|t\.me/\S+|wa\.me/\S+|bit\.ly/\S+'
    matched_urls = re.findall(url_pattern, text_clean)
    if matched_urls:
        indicators.append({
            "type": "External Link / Telegram Redirection",
            "detail": f"Contains unverified off-platform link: {matched_urls[0]}",
            "severity": "high"
        })
        risk_points += 20

    # ML Model Prediction
    artifact = get_sms_artifact()
    ml_prob = 0.0
    if artifact is not None and text_clean:
        try:
            cleaned = clean_text(text_clean)
            if isinstance(artifact, dict) and "model" in artifact and "vectorizer" in artifact:
                vec = artifact["vectorizer"].transform([cleaned])
                model = artifact["model"]
                if hasattr(model, "predict_proba"):
                    probs = model.predict_proba(vec)[0]
                    ml_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
                else:
                    pred = model.predict(vec)[0]
                    ml_prob = 0.90 if pred == 1 else 0.10
            elif hasattr(artifact, "predict_proba"):
                probs = artifact.predict_proba([text_clean])[0]
                ml_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            else:
                pred = artifact.predict([text_clean])[0]
                ml_prob = 0.90 if pred == 1 else 0.10
        except Exception as e:
            print(f"[ML] SMS prediction error: {e}")
            ml_prob = 0.5

    # Blended Score
    ml_score = int(ml_prob * 100)
    blended_score = int((ml_score * 0.55) + (min(risk_points, 100) * 0.45))
    threat_score = max(0, min(100, blended_score))

    if threat_score >= 75:
        threat_level = "Critical"
    elif threat_score >= 55:
        threat_level = "High Risk"
    elif threat_score >= 35:
        threat_level = "Medium Risk"
    elif threat_score >= 15:
        threat_level = "Low Risk"
    else:
        threat_level = "Safe"

    confidence_score = min(99, max(78, 80 + int(abs(threat_score - 50) * 0.38)))

    if threat_level in ["Critical", "High Risk"]:
        ai_explanation = (
            f"This message matches known cybercrime extortion / financial scam patterns ({', '.join(matched_categories) or 'Social Engineering Trap'}). "
            "It deliberately fabricates an urgent scenario or unrealistic financial reward to pressure you into transferring funds, sharing OTPs, or clicking phishing links."
        )
        potential_impact = "Financial loss via unauthorized UPI transfer, compromise of banking credentials, or personal extortion."
        recommended_actions = [
            "NEVER share OTPs, passwords, or enter your UPI PIN (entering PIN is only for sending money, never for receiving).",
            "Do NOT call phone numbers provided inside the message.",
            "Block the sender number and report as spam on WhatsApp / SMS carrier.",
            "File a complaint at the National Cyber Crime Reporting Portal (cybercrime.gov.in / Helpline 1930) if financial loss occurred."
        ]
    elif threat_level == "Medium Risk":
        ai_explanation = (
            "The message contains unsolicited promotional text or unfamiliar links. Exercise caution before responding."
        )
        potential_impact = "Potential spam subscription or exposure to advertising aggregators."
        recommended_actions = [
            "Do not click unverified shortened links.",
            "Ignore unsolicited promotional requests."
        ]
    else:
        ai_explanation = (
            "The message displays normal conversational tone without coercive urgency or fraud indicators."
        )
        potential_impact = "Normal communications risk profile."
        recommended_actions = ["Standard safe digital communication practices."]

    return {
        "threat_type": "message",
        "threat_level": threat_level,
        "threat_score": threat_score,
        "confidence_score": confidence_score,
        "is_threat": threat_score >= 40,
        "matched_scam_types": matched_categories,
        "detected_indicators": indicators,
        "ai_explanation": ai_explanation,
        "potential_impact": potential_impact,
        "recommended_actions": recommended_actions,
        "metadata": {
            "message_length": len(text_clean),
            "contains_phone": len(matched_phones) > 0,
            "contains_url": len(matched_urls) > 0
        }
    }
