"""
Unit tests for CyberShield AI SMS & WhatsApp Scam Classifier Service.
"""
import pytest
from backend.services.sms_service import analyze_message_threat, clean_text

def test_clean_sms_text():
    raw = "Your electricity will be cut at 9:30 PM! Call 9876543210."
    cleaned = clean_text(raw)
    assert "electricity" in cleaned
    assert "cut" in cleaned

def test_electricity_scam_detection():
    msg = "Dear customer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210."
    result = analyze_message_threat(msg)
    assert result["threat_score"] >= 40
    assert "Urgent Utility Disconnection Scam" in result["scam_type"]
    assert "9876543210" in result["extracted_phones"]

def test_sbi_kyc_scam_detection():
    msg = "Your SBI Bank account is blocked due to pending KYC. Click http://sbi-kyc-update.online to avoid deactivation."
    result = analyze_message_threat(msg)
    assert result["threat_score"] >= 60
    assert result["threat_level"] in ("High Risk", "Critical")
    assert any("KYC" in t for t in result["scam_type"])

def test_fedex_extortion_scam():
    msg = "FedEx Alert: Your international parcel contains illegal narcotics. Call Mumbai Police Cyber Cell immediately at +91-9812345678 to avoid arrest warrant."
    result = analyze_message_threat(msg)
    assert result["threat_score"] >= 60
    assert any("Extortion" in t or "Customs" in t for t in result["scam_type"])

def test_safe_conversational_message():
    msg = "Hey Sarah, are we still meeting for coffee at 4:00 PM today? Let me know!"
    result = analyze_message_threat(msg)
    assert result["threat_score"] <= 15
    assert result["threat_level"] == "Safe"
