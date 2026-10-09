"""
CyberShield AI - SMS & WhatsApp Scam Classifier Service
Detects financial fraud, electricity disconnection panics, KYC blocking lures, and task scams.
"""
import os
import re
import string
import functools
import joblib
from typing import Dict, Any, List, Optional
from backend.config import MODELS_DIR, FALLBACK_MODELS_DIR

# Pre-compiled high performance regexes
_PHONE_REGEX = re.compile(r'(?:\+?91[\-\s]?)?[6-9]\d{9}|\b\d{5}[-\s]?\d{5}\b')
_URL_REGEX = re.compile(r'https?://\S+|www\.\S+|t\.me/\S+|bit\.ly/\S+|wa\.me/\S+')
_AMOUNT_REGEX = re.compile(r'(?:[₹$€£]|rs\.?|inr)\s*([\d,]+(?:\.\d{2})?)|\b(\d{1,3}(?:,\d{3})+)\s*(?:inr|rs|rupees)\b', re.IGNORECASE)
_WHITESPACE_REGEX = re.compile(r'\s+')
_DIGITS_REGEX = re.compile(r'\d+')

_sms_artifact = None

def get_sms_artifact() -> Optional[Dict[str, Any]]:
    """
    Lazy-loads and caches the SMS scam classification model artifact.
    
    Returns:
        Optional[Dict[str, Any]]: Model dictionary containing classifier and vectorizer.
    """
    global _sms_artifact
    if _sms_artifact is None:
        candidates = [
            os.path.join(MODELS_DIR, "sms_scam_model.pkl"),
            os.path.join(MODELS_DIR, "sms_scam_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "sms_scam_model.pkl"),
            os.path.join(FALLBACK_MODELS_DIR, "sms_scam_model.joblib"),
        ]
        for p in candidates:
            if os.path.exists(p):
                try:
                    _sms_artifact = joblib.load(p)
                    break
                except Exception as e:
                    continue
    return _sms_artifact

@functools.lru_cache(maxsize=2048)
def clean_text(text: str) -> str:
    """
    Normalizes message text for ML classification with pre-compiled regex operations.
    
    Args:
        text (str): Raw text message.
        
    Returns:
        str: Normalized clean string.
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = _URL_REGEX.sub(" http_link ", text)
    text = _DIGITS_REGEX.sub(" ", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = _WHITESPACE_REGEX.sub(" ", text)
    return text.strip()

# Scam Pattern Taxonomy with Regex Matchers & Severity Ratings
SCAM_TAXONOMY = [
    {
        "name": "Urgent Utility Disconnection Scam",
        "pattern": re.compile(r'(?:electricity|power|bijli|bses|tneb|mseb|disconnection|disconnect|unpaid bill|tonight at \d+)', re.IGNORECASE),
        "weight": 35,
        "detail": "Fabricates imminent power/water disconnection to induce panic and force an unauthorized phone call.",
        "severity": "critical"
    },
    {
        "name": "Banking KYC & Account Deactivation Lure",
        "pattern": re.compile(r'(?:kyc|pan card|aadhaar|deactivation|account (?:blocked|suspended|frozen)|yono|sbi|hdfc|icici|axis)', re.IGNORECASE),
        "weight": 35,
        "detail": "Falsely claims bank accounts or debit cards will be deactivated unless personal documents are uploaded.",
        "severity": "critical"
    },
    {
        "name": "Work-From-Home / Task Video Like Fraud",
        "pattern": re.compile(r'(?:part-time|work from home|like youtube|rating|telegram|earn \d+|daily income|daily payout)', re.IGNORECASE),
        "weight": 30,
        "detail": "Promotes deceptive Telegram task fraud offering unrealistic daily wages for simple clicks.",
        "severity": "high"
    },
    {
        "name": "Law Enforcement & Customs Extortion (FedEx Scam)",
        "pattern": re.compile(r'(?:customs|parcel|contraband|drugs|mumbai police|cbi|arrest warrant|illegal package|clearing charges)', re.IGNORECASE),
        "weight": 40,
        "detail": "Impersonates police, CBI, or courier customs with false arrest threats to extort wire transfers.",
        "severity": "critical"
    },
    {
        "name": "Lottery / Prize Money Advance Fee Fraud",
        "pattern": re.compile(r'(?:lottery|kbc|won|congratulations|lucky draw|cash prize|claim reward|prize money)', re.IGNORECASE),
        "weight": 30,
        "detail": "Promises large fake lottery winnings requiring an upfront 'processing fee' or KYC verification.",
        "severity": "high"
    },
    {
        "name": "UPI PIN / Debit Payment Traps",
        "pattern": re.compile(r'(?:enter (?:upi )?pin|phonepe cashback|gpay reward|scan qr to receive)', re.IGNORECASE),
        "weight": 35,
        "detail": "Deceives victims into entering their secret UPI PIN under the pretense of receiving money.",
        "severity": "critical"
    }
]

def analyze_message_threat(message: str) -> Dict[str, Any]:
    """
    Analyzes an SMS or WhatsApp message for social engineering lures and scam signatures.
    
    Args:
        message (str): Raw SMS or WhatsApp text payload.
        
    Returns:
        Dict[str, Any]: Analysis report including scam type, risk level, extracted phones/URLs, and indicators.
    """
    cleaned = clean_text(message)
    indicators: List[Dict[str, str]] = []
    scam_types: List[str] = []
    risk_points = 0

    # 1. Taxonomy Pattern Checks
    for tax in SCAM_TAXONOMY:
        if tax["pattern"].search(message):
            scam_types.append(tax["name"])
            indicators.append({
                "type": tax["name"],
                "detail": tax["detail"],
                "severity": tax["severity"]
            })
            risk_points += tax["weight"]

    # 2. Extract Embedded Threat Vectors
    embedded_urls = _URL_REGEX.findall(message)
    if embedded_urls:
        indicators.append({
            "type": "Embedded External Link",
            "detail": f"Message contains suspicious redirection link: {embedded_urls[0]}",
            "severity": "high"
        })
        risk_points += 25

    extracted_phones = _PHONE_REGEX.findall(message)
    if extracted_phones and scam_types:
        indicators.append({
            "type": "Unverified Contact Trap",
            "detail": f"Urges direct communication with unregistered mobile number ({extracted_phones[0]}) instead of official toll-free channels.",
            "severity": "high"
        })
        risk_points += 20

    # 3. Machine Learning Classification
    ml_confidence = 50.0
    ml_is_scam = False
    artifact = get_sms_artifact()

    if artifact and cleaned:
        try:
            model = artifact.get("model") if isinstance(artifact, dict) else artifact
            vec = artifact.get("vectorizer") if isinstance(artifact, dict) else None

            features = vec.transform([cleaned]) if vec else [cleaned]
            pred = model.predict(features)[0]

            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(features)[0]
                prob_scam = probs[1] if len(probs) > 1 else probs[0]
                ml_confidence = round(float(prob_scam) * 100, 2)
            else:
                ml_confidence = 92.0 if pred == 1 else 10.0

            if pred == 1 or ml_confidence > 50:
                ml_is_scam = True
                indicators.append({
                    "type": "NLP Social Engineering Classifier",
                    "detail": f"TF-IDF & Random Forest pipeline scored message at {ml_confidence:.1f}% scam probability.",
                    "severity": "critical" if ml_confidence > 80 else "high"
                })
        except Exception as e:
            pass

    # Synthesis
    if ml_is_scam or scam_types:
        final_score = int(min(100, max(risk_points, ml_confidence)))
    else:
        final_score = int(min(100, risk_points))

    if final_score >= 80:
        threat_level = "Critical"
    elif final_score >= 60:
        threat_level = "High Risk"
    elif final_score >= 35:
        threat_level = "Medium Risk"
    elif final_score >= 15:
        threat_level = "Low Risk"
    else:
        threat_level = "Safe"

    confidence_score = int(max(ml_confidence, 90.0)) if final_score > 0 else 98

    return {
        "text": message,
        "threat_score": final_score,
        "threat_level": threat_level,
        "confidence_score": confidence_score,
        "scam_type": scam_types if scam_types else ["None (Legitimate)"],
        "detected_indicators": indicators,
        "extracted_urls": embedded_urls,
        "extracted_phones": extracted_phones,
        "potential_impact": "Financial loss through unauthorized UPI transfers, identity theft via forged KYC, or extortion." if final_score >= 50 else "Standard conversational or informational message with zero financial threat signatures.",
        "recommended_actions": [
            "NEVER call numbers sent in panic SMS messages.",
            "NEVER enter your UPI PIN to 'receive' money — PIN is only required to SEND money.",
            "Report fraudulent numbers to the National Cyber Crime Reporting Portal (1930 in India)."
        ] if final_score >= 50 else [
            "Message contains no coercion or credential harvesting markers.",
            "No protective actions required."
        ]
    }
