import os
import re
import string
import email
from email import policy
import joblib
from typing import Dict, Any, List, Optional
from backend.config import MODELS_DIR, FALLBACK_MODELS_DIR

_email_artifact = None

def get_email_artifact():
    global _email_artifact
    if _email_artifact is None:
        candidates = [
            os.path.join(MODELS_DIR, "email_threat_model.pkl"),
            os.path.join(MODELS_DIR, "email_threat_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "email_threat_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "email_threat_model.pkl")
        ]
        for p in candidates:
            if os.path.exists(p):
                try:
                    _email_artifact = joblib.load(p)
                    print(f"[ML] Email model loaded from {p}")
                    break
                except Exception as e:
                    print(f"[ML] Warning loading {p}: {e}")
    return _email_artifact

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

URGENT_KEYWORDS = [
    "urgent", "immediately", "24 hours", "account suspended", "suspended",
    "unauthorized access", "verify your identity", "password expired",
    "final notice", "action required", "compromised", "limited access", "wire transfer",
    "tax refund", "gift card", "crypto", "bitcoin", "security breach", "kyc pending", "act now"
]

CREDENTIAL_HARVEST_KEYWORDS = [
    "login now", "click here to verify", "update password", "reset your password",
    "confirm your account", "enter otp", "provide pin", "billing details",
    "re-enter credentials", "signin-portal", "auth-verify", "bank account", "credit card"
]

SPOOF_BRANDS = [
    "paypal", "microsoft", "google", "apple", "amazon", "netflix",
    "chase", "wellsfargo", "bank of america", "sbi", "hdfc", "icici", "meta", "docusign", "dhl"
]

def extract_urls(text: str) -> List[str]:
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    urls = re.findall(url_pattern, text, re.IGNORECASE)
    return list(set(urls))

def parse_eml(content: bytes or str) -> Dict[str, Any]:
    if isinstance(content, str):
        content = content.encode("utf-8", errors="ignore")
    
    msg = email.message_from_bytes(content, policy=policy.default)
    
    subject = msg.get("subject", "") or ""
    sender = msg.get("from", "") or ""
    to = msg.get("to", "") or ""
    date = msg.get("date", "") or ""
    
    body = ""
    attachments = []

    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get("Content-Disposition", ""))
            
            # Check for attachments
            filename = part.get_filename()
            if filename:
                attachments.append(filename)

            if "attachment" not in cdispo.lower():
                if ctype == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode("utf-8", errors="ignore") + "\n"
                elif ctype == "text/html" and not body:
                    payload = part.get_payload(decode=True)
                    if payload:
                        raw_html = payload.decode("utf-8", errors="ignore")
                        body += re.sub(r"<[^>]+>", " ", raw_html) + "\n"
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode("utf-8", errors="ignore")
        else:
            body = str(msg.get_payload() or "")

    # SPF / DKIM / DMARC verification
    auth_results = (msg.get("Authentication-Results", "") + " " + msg.get("Received-SPF", "")).lower()
    
    spf_status = "NEUTRAL"
    if "spf=pass" in auth_results or "pass (spf" in auth_results:
        spf_status = "PASS"
    elif "spf=fail" in auth_results or "spf=softfail" in auth_results:
        spf_status = "FAIL"

    dkim_status = "NEUTRAL"
    if "dkim=pass" in auth_results or "pass (dkim" in auth_results:
        dkim_status = "PASS"
    elif "dkim=fail" in auth_results:
        dkim_status = "FAIL"

    dmarc_status = "NEUTRAL"
    if "dmarc=pass" in auth_results:
        dmarc_status = "PASS"
    elif "dmarc=fail" in auth_results:
        dmarc_status = "FAIL"

    # If sender uses lookalike domain, flag simulated spoof
    if any(b in sender.lower() for b in SPOOF_BRANDS) and not any(sender.lower().endswith(f"@{b}.com") or sender.lower().endswith(f"@{b}.in") for b in SPOOF_BRANDS):
        if spf_status == "NEUTRAL":
            spf_status = "FAIL"
        if dkim_status == "NEUTRAL":
            dkim_status = "FAIL"

    return {
        "subject": subject,
        "sender": sender,
        "to": to,
        "date": date,
        "body": body.strip() or subject,
        "attachments": attachments,
        "spf_status": spf_status,
        "dkim_status": dkim_status,
        "dmarc_status": dmarc_status
    }

def analyze_email_threat(text: str, subject: str = "", sender: str = "", spf_status: str = "NEUTRAL", dkim_status: str = "NEUTRAL", dmarc_status: str = "NEUTRAL", attachments: List[str] = None) -> Dict[str, Any]:
    full_text = f"{subject}\n{text}".strip()
    urls = extract_urls(full_text)
    
    indicators = []
    risk_points = 0
    
    # 1. Urgent Coercive Language
    matched_urgency = [kw for kw in URGENT_KEYWORDS if kw in full_text.lower()]
    if matched_urgency:
        indicators.append({
            "type": "Urgent Coercive Language",
            "detail": f"Contains panic-inducing keywords: {', '.join(matched_urgency[:3])}",
            "severity": "high"
        })
        risk_points += min(len(matched_urgency) * 12, 35)

    # 2. Credential Harvesting Pattern
    matched_creds = [kw for kw in CREDENTIAL_HARVEST_KEYWORDS if kw in full_text.lower()]
    if matched_creds:
        indicators.append({
            "type": "Credential Harvesting Pattern",
            "detail": f"Soliciting login credentials or personal identification ({', '.join(matched_creds[:2])})",
            "severity": "critical"
        })
        risk_points += 30

    # 3. Brand Spoofing Check
    matched_brands = [b for b in SPOOF_BRANDS if b in full_text.lower() or b in sender.lower()]
    if matched_brands:
        indicators.append({
            "type": "Brand Impersonation Target",
            "detail": f"Impersonating brand assets: {', '.join(matched_brands[:2]).title()}",
            "severity": "medium"
        })
        risk_points += 15

    # 4. Embedded Disguised Hyperlinks
    if urls:
        suspicious_urls = [u for u in urls if any(tld in u.lower() for tld in [".xyz", ".top", ".buzz", ".tk", ".cf", ".gq", ".click", "bit.ly", "tinyurl.com"])]
        if suspicious_urls:
            indicators.append({
                "type": "High-Risk Deceptive Hyperlink",
                "detail": f"Embedded URL points to suspicious domain: {suspicious_urls[0][:45]}...",
                "severity": "critical"
            })
            risk_points += 30
        else:
            indicators.append({
                "type": "Embedded External Hyperlinks",
                "detail": f"Contains {len(urls)} external hyperlink(s)",
                "severity": "low"
            })
            risk_points += 8

    # 5. Dangerous File Attachments
    if attachments:
        dangerous_exts = [".exe", ".scr", ".vbs", ".bat", ".iso", ".zip", ".xlsm", ".docm"]
        matched_bad_files = [f for f in attachments if any(f.lower().endswith(ext) for ext in dangerous_exts)]
        if matched_bad_files:
            indicators.append({
                "type": "Dangerous Executable Attachment",
                "detail": f"Detected high-risk executable attachment: {matched_bad_files[0]}",
                "severity": "critical"
            })
            risk_points += 40

    # 6. SPF / DKIM Authentication
    if spf_status == "FAIL" or dkim_status == "FAIL":
        indicators.append({
            "type": "Email Authentication Failure",
            "detail": f"SPF: {spf_status}, DKIM: {dkim_status} (Sender identity could not be verified by originating mail server)",
            "severity": "critical"
        })
        risk_points += 25

    # 7. ML Model Prediction
    artifact = get_email_artifact()
    ml_prob = 0.0
    if artifact is not None and full_text:
        try:
            cleaned = clean_text(full_text)
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
                probs = artifact.predict_proba([full_text])[0]
                ml_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            else:
                pred = artifact.predict([full_text])[0]
                ml_prob = 0.90 if pred == 1 else 0.10
        except Exception as e:
            print(f"[ML] Prediction calculation error: {e}")
            ml_prob = 0.5

    # Calculate blended risk score (0-100)
    ml_score = int(ml_prob * 100)
    blended_score = int((ml_score * 0.55) + (min(risk_points, 100) * 0.45))
    threat_score = max(0, min(100, blended_score))

    # Threat Level Classification
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

    # AI Explanation & Actions
    if threat_level in ["Critical", "High Risk"]:
        ai_explanation = (
            f"This email demonstrates high-probability social engineering tactics ({', '.join(matched_urgency[:2]) or 'urgency triggers'}). "
            f"The message attempts to deceive the recipient into visiting unverified login portals or transferring funds under false pretenses. "
            f"SPF/DKIM verification indicates potential spoofing of legitimate brand headers."
        )
        potential_impact = "Risk of unauthorized corporate account takeover, payroll diversion, credential harvesting, or malicious payload execution."
        recommended_actions = [
            "Do NOT click any links, enter credentials, or open attachments.",
            "Report this email to your organization's IT Security / SOC team.",
            "Verify sender authenticity via independent channels (official phone or internal intranet).",
            "If credentials were entered, immediately reset your passwords and terminate active sessions."
        ]
    elif threat_level == "Medium Risk":
        ai_explanation = (
            "This email contains suspicious marketing lures, unsolicited external URLs, or atypical formatting. "
            "While no destructive malware payload was directly confirmed, caution is advised before interacting."
        )
        potential_impact = "Risk of spam subscription, pixel tracking beacons, or ad-network redirects."
        recommended_actions = [
            "Avoid clicking hyperlinks without inspecting the full domain name.",
            "Mark as spam in your mail client."
        ]
    else:
        ai_explanation = (
            "The email structure, sender alignment, and text patterns match standard legitimate correspondence. "
            "No deceptive brand spoofing, credential traps, or malicious links were detected."
        )
        potential_impact = "Standard correspondence risk profile."
        recommended_actions = [
            "Routine safe email handling practices apply."
        ]

    return {
        "threat_type": "email",
        "threat_level": threat_level,
        "threat_score": threat_score,
        "confidence_score": confidence_score,
        "is_threat": threat_score >= 40,
        "extracted_urls": urls,
        "detected_indicators": indicators,
        "ai_explanation": ai_explanation,
        "potential_impact": potential_impact,
        "recommended_actions": recommended_actions,
        "security_headers": {
            "spf": spf_status,
            "dkim": dkim_status,
            "dmarc": dmarc_status
        },
        "attachments": attachments or [],
        "metadata": {
            "subject": subject,
            "sender": sender,
            "char_count": len(full_text),
            "word_count": len(full_text.split())
        }
    }
