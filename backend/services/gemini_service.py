import os
import json
from typing import Dict, Any, List, Optional
from backend.config import GEMINI_API_KEY, GEMINI_MODEL

# Try importing google.genai
try:
    from google import genai
    from google.genai import types
    GENAI_CLIENT_AVAILABLE = True
except Exception:
    GENAI_CLIENT_AVAILABLE = False

_client = None

def get_genai_client():
    global _client
    if _client is None and GENAI_CLIENT_AVAILABLE and GEMINI_API_KEY:
        try:
            _client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            print(f"[Gemini] Error initializing client: {e}")
            _client = None
    return _client

CYBER_KNOWLEDGE_BASE = {
    "phishing": "Phishing is a social engineering attack where attackers impersonate trustworthy entities (banks, Microsoft, Google, PayPal) to steal sensitive credentials, session tokens, or credit card numbers. Never click unverified login links.",
    "upi": "UPI safety rule #1: You NEVER need to enter your UPI PIN or scan a QR code to receive money. Entering a PIN always transfers funds OUT of your account.",
    "typosquatting": "Typosquatting (URL hijacking) is where attackers register domains that resemble legitimate websites with small typos (e.g. `paypa1.com`, `g00gle.com`) to trick users into trusting fake login portals.",
    "ransomware": "Ransomware is malicious software that encrypts your files and demands ransom. Prevention involves maintaining offline backups, keeping OS updated, and disabling unauthorized macros.",
    "mfa": "Multi-Factor Authentication (MFA/2FA) adds a vital security layer beyond passwords. Use authenticator apps (TOTP) or hardware security keys (FIDO2/WebAuthn) rather than SMS where possible.",
    "quishing": "Quishing (QR Code Phishing) is when malicious actors replace or display malicious QR codes that trick mobile cameras into navigating to fraudulent credential-harvesting websites."
}

def generate_threat_explanation(scan_type: str, content_snippet: str, indicators: List[Dict[str, Any]], threat_score: int) -> str:
    """Generates human-readable AI explanation using Gemini API or fallback domain expert system."""
    client = get_genai_client()
    if client:
        try:
            prompt = (
                f"You are CyberShield AI, an enterprise SOC threat explanation assistant. "
                f"Explain to a non-technical user in 2 concise paragraphs why this {scan_type} is flagged with a Threat Score of {threat_score}/100. "
                f"Content snippet: '{content_snippet[:300]}'. "
                f"Detected Indicators: {json.dumps([ind.get('detail') for ind in indicators])}. "
                f"Focus on the social engineering tricks, psychological manipulation, and why they should not trust it."
            )
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"[Gemini] Explanation generation error: {e}")

    # High-quality fallback explanation generator
    indicator_summary = "; ".join([ind.get("type", "") for ind in indicators[:3]])
    if threat_score >= 70:
        return (
            f"This {scan_type} has been flagged as a dangerous cyber threat (Score: {threat_score}/100). "
            f"Our AI detected deceptive social engineering triggers including: {indicator_summary or 'urgent manipulation'}. "
            f"The sender or author aims to exploit psychological pressure to bypass your natural skepticism and force a hasty decision. "
            f"Do not interact with the links, do not reply, and do not provide any personal or banking authentication data."
        )
    elif threat_score >= 35:
        return (
            f"This {scan_type} exhibits suspicious anomalies (Score: {threat_score}/100) such as {indicator_summary or 'unverified source formatting'}. "
            f"While it may not contain an active exploit, it matches unsolicited advertising or deceptive redirection patterns. Exercise heightened caution."
        )
    else:
        return (
            f"Our multi-layer threat analysis determined this {scan_type} is clean and safe (Score: {threat_score}/100). "
            f"No malicious links, credential traps, or fraudulent manipulation patterns were identified."
        )

def chat_with_security_assistant(message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """Conversational AI Security Assistant."""
    client = get_genai_client()
    if client:
        try:
            system_prompt = (
                "You are CyberShield Copilot, an elite AI cybersecurity assistant. "
                "Help users understand cybersecurity threats, phishing emails, scam messages, UPI frauds, safe browsing, and incident containment. "
                "Provide clear, actionable, and friendly guidance. Keep answers structured and helpful."
            )
            prompt = f"{system_prompt}\n\nUser Question: {message}"
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"[Gemini] Chat assistant error: {e}")

    # Comprehensive fallback conversational reasoning
    msg_lower = message.lower()
    for key, explanation in CYBER_KNOWLEDGE_BASE.items():
        if key in msg_lower:
            return f"**CyberShield Security Insight on {key.upper()}**:\n\n{explanation}\n\n*Actionable Advice*: Always verify the sender's origin through an independent channel, verify domain spelling, and never disclose one-time passwords (OTP) or UPI PINs."

    if "safe" in msg_lower or "check" in msg_lower:
        return "To verify whether an email, URL, message, or QR code is safe, use the **CyberShield AI Threat Scanner** from the top navigation bar. You can paste the content or upload screenshots/QR codes for real-time ML analysis and risk scoring."
    
    if "help" in msg_lower or "fraud" in msg_lower or "hacked" in msg_lower:
        return (
            "**Emergency Security Steps:**\n"
            "1. **Disconnect & Isolate**: Disconnect the affected device from Wi-Fi / mobile networks.\n"
            "2. **Freeze Accounts**: If financial details were leaked, immediately contact your bank to freeze credit cards or UPI handles.\n"
            "3. **Change Credentials**: Reset master passwords from a clean device and enable MFA.\n"
            "4. **Report**: File an official report on your country's cybercrime portal (in India: cybercrime.gov.in or helpline 1930)."
        )

    return (
        "I am your CyberShield AI Security Copilot. You can ask me to evaluate suspicious emails, explain phishing indicators, "
        "clarify how UPI scams operate, check URL safety principles, or provide step-by-step incident response advice."
    )
