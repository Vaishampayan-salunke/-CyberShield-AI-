"""
Unit tests for CyberShield AI QR Matrix & Screenshot OCR Threat Analysis.
"""
import pytest
from backend.services.qr_service import analyze_qr_threat
from backend.services.ocr_service import analyze_screenshot_threat

def test_upi_debit_trap_qr():
    upi_payload = "upi://pay?pa=scammer-merchant@icici&pn=Refund%20Officer&am=5000&cu=INR&tn=UPI%20Cashback%20Reward"
    result = analyze_qr_threat(b"", fallback_url=upi_payload)
    assert result["threat_score"] >= 80
    assert result["threat_level"] == "Critical"
    assert result["is_upi"] is True
    assert any("UPI" in i["type"] for i in result["detected_indicators"])

def test_quishing_url_qr():
    quishing_url = "https://secure-login-verify.sbi-portal.xyz/kyc/update?ref=qr_auth"
    result = analyze_qr_threat(b"", fallback_url=quishing_url)
    assert result["threat_score"] >= 60
    assert result["is_upi"] is False
    assert any("Quishing" in i["type"] or "Brand" in i["type"] for i in result["detected_indicators"])

def test_screenshot_threat_with_scam_text():
    sample_text = "STATE BANK ALERT: Your YONO account is blocked today due to pending KYC update. Click http://sbi-kyc-verify.online to update."
    result = analyze_screenshot_threat(b"dummy_image_data", client_text=sample_text)
    assert result["threat_score"] >= 60
    assert result["threat_level"] in ("High Risk", "Critical")
    assert result["extracted_text"] == sample_text

def test_screenshot_clean_text():
    sample_text = "Hey! Let's meet for our team sync at 2 PM in the main conference room."
    result = analyze_screenshot_threat(b"dummy_image_data", client_text=sample_text)
    assert result["threat_score"] <= 20
    assert result["threat_level"] == "Safe"
