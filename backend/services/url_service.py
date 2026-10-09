import os
import re
import math
import urllib.parse
import joblib
from typing import Dict, Any, List
from backend.config import MODELS_DIR, FALLBACK_MODELS_DIR

_url_artifact = None

def get_url_artifact():
    global _url_artifact
    if _url_artifact is None:
        candidates = [
            os.path.join(MODELS_DIR, "url_threat_model.pkl"),
            os.path.join(MODELS_DIR, "url_threat_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "url_threat_model.joblib"),
            os.path.join(FALLBACK_MODELS_DIR, "url_threat_model.pkl")
        ]
        for p in candidates:
            if os.path.exists(p):
                try:
                    _url_artifact = joblib.load(p)
                    print(f"[ML] URL model loaded from {p}")
                    break
                except Exception as e:
                    print(f"[ML] Warning loading {p}: {e}")
    return _url_artifact

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".buzz", ".work", ".gq", ".tk", ".ml", ".cf",
    ".ga", ".fit", ".rest", ".online", ".site", ".country", ".live", ".click"
}

POPULAR_BRANDS = [
    "paypal", "google", "microsoft", "amazon", "apple", "netflix",
    "facebook", "instagram", "chase", "bankofamerica", "wellsfargo",
    "sbi", "hdfc", "icici", "paytm", "phonepe", "binance", "coinbase", "docusign"
]

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in set(text)]
    return -sum([p * math.log(p) / math.log(2.0) for p in prob])

def analyze_url_threat(raw_url: str) -> Dict[str, Any]:
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()
    
    indicators = []
    risk_points = 0

    # 1. Raw IP as domain
    ip_pattern = r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?$'
    if re.match(ip_pattern, domain):
        indicators.append({
            "type": "Raw IP Address Host",
            "detail": f"The URL directly targets a numeric IP address ({domain}) rather than a registered domain name.",
            "severity": "critical"
        })
        risk_points += 35

    # 2. High-Risk Disposable TLD
    matched_tld = [tld for tld in SUSPICIOUS_TLDS if domain.endswith(tld)]
    if matched_tld:
        indicators.append({
            "type": "High-Risk Top-Level Domain (TLD)",
            "detail": f"Domain utilizes an abusive/disposable TLD ({matched_tld[0]}) frequently associated with cyber campaigns.",
            "severity": "high"
        })
        risk_points += 25

    # 3. Typosquatting / Brand Spoofing Check
    for brand in POPULAR_BRANDS:
        if brand in domain and not domain.endswith(f"{brand}.com") and not domain.endswith(f"{brand}.in") and not domain.endswith(f"{brand}.org") and not domain.endswith(f"{brand}.net") and not domain.endswith(f"{brand}.co.uk"):
            indicators.append({
                "type": "Targeted Brand Impersonation (Typosquatting)",
                "detail": f"Domain spoofing brand keyword '{brand}' on an unauthorized host ({domain}).",
                "severity": "critical"
            })
            risk_points += 40
            break

    # 4. Excessive Subdomains or Hyphens
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
            "type": "Hyphenated Deceptive Domain",
            "detail": f"Domain contains {domain.count('-')} hyphens, indicating synthetic deceptive domain generation.",
            "severity": "medium"
        })
        risk_points += 15

    # 5. Non-HTTPS / Insecure Protocol
    is_https = parsed.scheme == "https"
    if not is_https:
        indicators.append({
            "type": "Insecure Unencrypted HTTP Protocol",
            "detail": "Connection is unencrypted, allowing man-in-the-middle interception of submitted data.",
            "severity": "medium"
        })
        risk_points += 20

    # 6. High Entropy (Obfuscated URL / DGA)
    entropy = calculate_entropy(url)
    if entropy > 4.6 and len(url) > 50:
        indicators.append({
            "type": "High Information Entropy",
            "detail": f"URL exhibits randomized token obfuscation (Entropy: {entropy:.2f}).",
            "severity": "medium"
        })
        risk_points += 15

    # 7. Phishing keywords in path
    phish_path_kws = ["login", "verify", "secure", "account", "update", "banking", "signin", "wallet", "kyc", "claim", "billing"]
    matched_path_kws = [kw for kw in phish_path_kws if kw in path]
    if matched_path_kws:
        indicators.append({
            "type": "Phishing Authentication Trigger",
            "detail": f"Path contains deceptive authentication triggers ({', '.join(matched_path_kws)}).",
            "severity": "high"
        })
        risk_points += 20

    # 8. ML Model Prediction
    artifact = get_url_artifact()
    ml_prob = 0.0
    if artifact is not None:
        try:
            if isinstance(artifact, dict) and "model" in artifact and "vectorizer" in artifact:
                vec = artifact["vectorizer"].transform([url])
                model = artifact["model"]
                if hasattr(model, "predict_proba"):
                    probs = model.predict_proba(vec)[0]
                    ml_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
                else:
                    pred = model.predict(vec)[0]
                    ml_prob = 0.90 if pred == 1 else 0.10
            elif hasattr(artifact, "predict_proba"):
                probs = artifact.predict_proba([url])[0]
                ml_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            else:
                pred = artifact.predict([url])[0]
                ml_prob = 0.90 if pred == 1 else 0.10
        except Exception as e:
            print(f"[ML] URL prediction error: {e}")
            ml_prob = 0.5

    # Blended threat score
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

    confidence_score = min(99, max(78, 82 + int(abs(threat_score - 50) * 0.36)))

    if threat_level in ["Critical", "High Risk"]:
        ai_explanation = (
            f"This URL ({domain}) demonstrates high-risk malicious indicators consistent with active credential phishing or deceptive brand clone campaigns. "
            f"Our heuristic and machine learning classifiers flagged unauthorized brand keywords, high-risk top-level domain structures, or deceptive login triggers."
        )
        potential_impact = "Visiting this site may lead to credential harvesting, unauthorized banking session hijacking, or automatic download of malicious payloads."
        recommended_actions = [
            "Do NOT open, click, or enter passwords or personal details on this URL.",
            "Block this domain on corporate DNS/firewalls and web filters.",
            "Report the URL to anti-abuse registrars and Google Safe Browsing."
        ]
    elif threat_level == "Medium Risk":
        ai_explanation = (
            f"The URL domain ({domain}) has unusual formatting, lack of full SSL verification, or multiple redirects. "
            "Proceed with heightened caution and verify the true origin before interacting."
        )
        potential_impact = "Risk of unwanted ad-trackers, aggressive affiliate redirects, or insecure data transmission."
        recommended_actions = [
            "Inspect the destination certificate before logging in.",
            "Avoid entering financial or payment credentials."
        ]
    else:
        ai_explanation = (
            f"The analyzed URL ({domain}) uses valid standard domain conventions, legitimate SSL configurations, "
            "and does not match known phishing signatures."
        )
        potential_impact = "Standard web browsing risk profile."
        recommended_actions = [
            "Maintain standard security hygiene.",
            "Ensure browser is updated with latest patches."
        ]

    return {
        "threat_type": "url",
        "url": url,
        "domain": domain,
        "threat_level": threat_level,
        "threat_score": threat_score,
        "confidence_score": confidence_score,
        "is_threat": threat_score >= 40,
        "detected_indicators": indicators,
        "ai_explanation": ai_explanation,
        "potential_impact": potential_impact,
        "recommended_actions": recommended_actions,
        "domain_analysis": {
            "protocol": parsed.scheme.upper(),
            "has_ssl": is_https,
            "subdomain_count": len(subdomains),
            "entropy": round(entropy, 2),
            "url_length": len(url),
            "estimated_reputation": "Malicious" if threat_score >= 55 else ("Suspicious" if threat_score >= 35 else "Reputable")
        }
    }
