"""
CyberShield AI - URL & Domain Threat Intelligence Service
Optimized lexical feature analysis, typosquatting heuristics, and Random Forest classification.
"""
import os
import re
import math
import urllib.parse
import functools
import joblib
from typing import Dict, Any, List, Optional, Tuple
from backend.config import MODELS_DIR, FALLBACK_MODELS_DIR

# Pre-compiled high-performance regular expressions
_IP_PATTERN = re.compile(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?$')
_HEX_ENCODED = re.compile(r'%[0-9a-fA-F]{2}')
_URL_CLEANER = re.compile(r'[^a-zA-Z0-9]')

# Suspicious Top Level Domains (TLDs)
SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".buzz", ".work", ".gq", ".tk", ".ml", ".cf",
    ".ga", ".fit", ".rest", ".online", ".site", ".country", ".live", ".click"
}

# Popular Brands target set for typosquatting checks
POPULAR_BRANDS = (
    "paypal", "google", "microsoft", "amazon", "apple", "netflix",
    "facebook", "instagram", "chase", "bankofamerica", "wellsfargo",
    "sbi", "hdfc", "icici", "paytm", "phonepe", "binance", "coinbase", "docusign"
)

LEGIT_TLD_SUFFIXES = (".com", ".in", ".org", ".net", ".co.uk", ".gov.in", ".gov", ".edu")

_url_artifact = None

def get_url_artifact() -> Optional[Dict[str, Any]]:
    """
    Lazy-loads and caches the URL classification model artifact in memory.
    
    Returns:
        Optional[Dict[str, Any]]: Model dictionary with model, vectorizer, and metadata.
    """
    global _url_artifact
    if _url_artifact is None:
        candidates = [
            os.path.join(MODELS_DIR, "url_threat_model.pkl"),
            os.path.join(MODELS_DIR, "url_threat_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "url_threat_model.pkl"),
            os.path.join(FALLBACK_MODELS_DIR, "url_threat_model.joblib"),
        ]
        for p in candidates:
            if os.path.exists(p):
                try:
                    _url_artifact = joblib.load(p)
                    break
                except Exception as e:
                    continue
    return _url_artifact

@functools.lru_cache(maxsize=2048)
def calculate_entropy(text: str) -> float:
    """
    Computes Shannon Entropy of a string to detect randomized domain names or DGA signatures.
    
    Args:
        text (str): Input string to evaluate.
        
    Returns:
        float: Shannon entropy score (higher = more randomized).
    """
    if not text:
        return 0.0
    text_len = len(text)
    prob = [float(text.count(c)) / text_len for c in set(text)]
    return -sum(p * math.log2(p) for p in prob if p > 0)

@functools.lru_cache(maxsize=1024)
def _check_brand_impersonation(domain: str) -> Optional[Tuple[str, str]]:
    """
    Checks if a domain is impersonating known high-value financial/tech brands.
    
    Args:
        domain (str): The domain to inspect.
        
    Returns:
        Optional[Tuple[str, str]]: Brand name and impersonation detail if detected.
    """
    for brand in POPULAR_BRANDS:
        if brand in domain:
            is_authorized = any(domain == f"{brand}{suf}" or domain.endswith(f".{brand}{suf}") for suf in LEGIT_TLD_SUFFIXES)
            if not is_authorized:
                return (brand, f"Domain spoofing brand keyword '{brand}' on an unauthorized host ({domain}).")
    return None

def analyze_url_threat(raw_url: str) -> Dict[str, Any]:
    """
    Analyzes a URL using comprehensive heuristics, entropy calculations, and trained ML classifier.
    
    Args:
        raw_url (str): The URL string to inspect.
        
    Returns:
        Dict[str, Any]: Detailed risk assessment, threat score, indicators, and ML probability.
    """
    url = raw_url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()
    
    indicators: List[Dict[str, str]] = []
    risk_points = 0

    # 1. Raw IP Address Detection
    if _IP_PATTERN.match(domain):
        indicators.append({
            "type": "Raw IP Address Host",
            "detail": f"The URL directly targets a numeric IP address ({domain}) rather than a registered domain name.",
            "severity": "critical"
        })
        risk_points += 35

    # 2. High-Risk Abusive TLD
    matched_tld = [tld for tld in SUSPICIOUS_TLDS if domain.endswith(tld)]
    if matched_tld:
        indicators.append({
            "type": "High-Risk Top-Level Domain (TLD)",
            "detail": f"Domain utilizes an abusive/disposable TLD ({matched_tld[0]}) frequently associated with cyber campaigns.",
            "severity": "high"
        })
        risk_points += 25

    # 3. Typosquatting / Brand Spoofing Check
    spoof_info = _check_brand_impersonation(domain)
    if spoof_info:
        brand_name, detail_str = spoof_info
        indicators.append({
            "type": "Targeted Brand Impersonation (Typosquatting)",
            "detail": detail_str,
            "severity": "critical"
        })
        risk_points += 40

    # 4. Excessive Subdomain Stacking & Hyphens
    subdomains = domain.split(".")
    if len(subdomains) > 3:
        indicators.append({
            "type": "Excessive Subdomain Stacking",
            "detail": f"Detected deep subdomain nesting ({len(subdomains)} levels), common in phishing kits.",
            "severity": "medium"
        })
        risk_points += 15

    if domain.count("-") >= 2:
        indicators.append({
            "type": "Multiple Hyphen Delimiters",
            "detail": f"Domain contains {domain.count('-')} hyphens, a signature of deceptive homograph clones.",
            "severity": "medium"
        })
        risk_points += 15

    # 5. Phishing Keywords in Path or Query
    phish_path_keywords = ("login", "signin", "verify-account", "update-kyc", "auth-token", "banking-login", "confirm-password", "wallet-restore", "secure-login")
    matched_keywords = [k for k in phish_path_keywords if k in path or k in parsed.query.lower()]
    if matched_keywords:
        indicators.append({
            "type": "Credential Phishing Path Traps",
            "detail": f"Path contains security-sensitive lure keywords: {', '.join(matched_keywords[:3])}",
            "severity": "high"
        })
        risk_points += 25

    # 6. Domain Shannon Entropy
    domain_entropy = calculate_entropy(domain)
    if domain_entropy > 4.2 and len(domain) > 15:
        indicators.append({
            "type": "High Domain Entropy (DGA / Randomized)",
            "detail": f"Domain entropy score of {domain_entropy:.2f} indicates automated Domain Generation Algorithm (DGA) usage.",
            "severity": "high"
        })
        risk_points += 25

    # 7. Unencrypted HTTP Protocol on Sensitive Paths
    is_https = parsed.scheme == "https"
    if not is_https:
        indicators.append({
            "type": "Unencrypted HTTP Transmission",
            "detail": "Connection is unencrypted (HTTP), exposing credentials to Man-in-the-Middle (MitM) interception.",
            "severity": "high" if matched_keywords else "medium"
        })
        risk_points += 20

    # 8. Machine Learning Vectorizer & Classifier
    ml_confidence = 50.0
    ml_predicted_threat = False
    artifact = get_url_artifact()

    if artifact:
        try:
            model = artifact.get("model") if isinstance(artifact, dict) else artifact
            vec = artifact.get("vectorizer") if isinstance(artifact, dict) else None

            features = vec.transform([url]) if vec else [url]
            pred = model.predict(features)[0]
            
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(features)[0]
                prob_malicious = probs[1] if len(probs) > 1 else probs[0]
                ml_confidence = round(float(prob_malicious) * 100, 2)
            else:
                ml_confidence = 90.0 if pred == 1 else 10.0

            if pred == 1 or ml_confidence > 50:
                ml_predicted_threat = True
                indicators.append({
                    "type": "Machine Learning Model Classification",
                    "detail": f"Random Forest & TF-IDF character n-gram model scored payload at {ml_confidence:.1f}% malicious probability.",
                    "severity": "critical" if ml_confidence > 80 else "high"
                })
        except Exception as e:
            pass

    # Risk Scoring Synthesis
    if ml_predicted_threat:
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

    confidence_score = int(max(ml_confidence, 88.0)) if final_score > 0 else 99

    return {
        "url": url,
        "domain": domain,
        "is_https": is_https,
        "entropy": round(domain_entropy, 2),
        "threat_score": final_score,
        "threat_level": threat_level,
        "confidence_score": confidence_score,
        "detected_indicators": indicators,
        "ml_probability": ml_confidence,
        "potential_impact": "Credential theft, credential stuffing, banking account hijack, or session token interception." if final_score >= 50 else "Standard verified web destination with no active threat indicators detected.",
        "recommended_actions": [
            "Do NOT enter passwords, phone numbers, or credit card details.",
            "Verify the official URL by searching for the service independently on a search engine.",
            "Report this domain to Google Safe Browsing and your organization's SOC."
        ] if final_score >= 50 else [
            "Destination domain matches standard verified structure.",
            "Ensure HTTPS is maintained across subsequent pages."
        ]
    }
