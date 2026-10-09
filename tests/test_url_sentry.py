"""
Unit tests for CyberShield AI URL & Domain Threat Intelligence Service.
"""
import pytest
from backend.services.url_service import analyze_url_threat, calculate_entropy

def test_entropy_calculation():
    low_entropy = calculate_entropy("google.com")
    high_entropy = calculate_entropy("x89234jk109asdlkjf98234.xyz")
    assert high_entropy > low_entropy

def test_typosquatting_phishing_url():
    url = "http://secure-chase-update-login.xyz/banking/auth?session=expired"
    result = analyze_url_threat(url)
    assert result["threat_score"] >= 70
    assert result["threat_level"] in ("High Risk", "Critical")
    assert any("Typosquatting" in i["type"] or "Brand" in i["type"] for i in result["detected_indicators"])

def test_raw_ip_address_url():
    url = "http://192.168.1.150/login.php"
    result = analyze_url_threat(url)
    assert result["threat_score"] >= 35
    assert any("IP Address" in i["type"] for i in result["detected_indicators"])

def test_suspicious_tld_url():
    url = "https://free-tax-refund.top/claim"
    result = analyze_url_threat(url)
    assert any("Top-Level Domain" in i["type"] for i in result["detected_indicators"])

def test_legitimate_url():
    url = "https://www.google.com"
    result = analyze_url_threat(url)
    assert result["threat_score"] <= 15
    assert result["threat_level"] == "Safe"
    assert result["is_https"] is True
