"""
Unit tests for CyberShield AI Email Threat Detection Service.
"""
import pytest
from backend.services.email_service import analyze_email_threat, parse_eml, clean_text, extract_urls

def test_clean_text():
    raw = "URGENT! Please visit https://paypa1-verify.xyz/login immediately."
    cleaned = clean_text(raw)
    assert "urgent" in cleaned
    assert "httplink" in cleaned
    assert "!" not in cleaned

def test_extract_urls():
    text = "Visit https://bank-verify.online and http://192.168.1.1/auth now."
    urls = extract_urls(text)
    assert len(urls) == 2
    assert "https://bank-verify.online" in urls

def test_phishing_email_detection():
    result = analyze_email_threat(
        subject="Urgent: Your PayPal account has been limited",
        sender="security@paypa1-support.com",
        body="Dear customer, your account was accessed from Russia. Confirm your password here: http://paypa1-verify.xyz/auth within 24 hours."
    )
    assert result["threat_score"] >= 70
    assert result["threat_level"] in ("High Risk", "Critical")
    assert any("Urgency" in i["type"] or "Credential" in i["type"] or "Brand" in i["type"] for i in result["detected_indicators"])

def test_safe_email_detection():
    result = analyze_email_threat(
        subject="Quarterly Sprint Planning Agenda",
        sender="alex.chen@techcorp.io",
        body="Hi team, attached is the sprint backlog for our planning session on Thursday. Thanks!"
    )
    assert result["threat_score"] <= 20
    assert result["threat_level"] == "Safe"

def test_eml_parsing_and_auth_headers():
    eml_content = """From: Security Team <alert@paypa1-fake.xyz>
To: victim@example.com
Subject: Password Expired
Authentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail
MIME-Version: 1.0
Content-Type: text/plain

Please update your credentials immediately.
"""
    parsed = parse_eml(eml_content)
    assert parsed["headers"]["spf"] == "FAIL"
    assert parsed["headers"]["dkim"] == "FAIL"
    
    result = analyze_email_threat(
        subject=parsed["subject"],
        sender=parsed["sender"],
        body=parsed["body"],
        headers=parsed["headers"]
    )
    assert any("SPF" in i["type"] or "Spoofing" in i["type"] for i in result["detected_indicators"])
    assert result["threat_score"] >= 60

def test_dangerous_attachment_detection():
    result = analyze_email_threat(
        subject="Your Invoice Document",
        sender="billing@unknown.top",
        body="Attached is your overdue invoice. Please review.",
        attachments=["Invoice_9842.exe", "receipt.pdf"]
    )
    assert any("Executable Attachment" in i["type"] for i in result["detected_indicators"])
    assert result["threat_score"] >= 45
