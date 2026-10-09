"""
Unit tests for CyberShield AI FastAPI Endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "CyberShield" in data["service"]

def test_scan_email_endpoint():
    payload = {
        "text": "Your account access has been restricted. Click http://paypa1-security.xyz/auth immediately.",
        "subject": "Urgent Security Alert",
        "sender": "security@paypa1-security.xyz"
    }
    response = client.post("/api/scan/email", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["threat_score"] >= 60
    assert "detected_indicators" in data

def test_scan_url_endpoint():
    payload = {
        "url": "http://secure-chase-login-update.xyz/banking/auth"
    }
    response = client.post("/api/scan/url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["threat_score"] >= 60
    assert "domain" in data

def test_scan_message_endpoint():
    payload = {
        "message": "Dear customer, your electricity power will be disconnected tonight at 9:30 PM. Call officer at 9876543210."
    }
    response = client.post("/api/scan/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["threat_score"] >= 40
    assert "scam_type" in data

def test_quick_scan_endpoint():
    payload = {
        "content": "http://netflix-billing-update.club/renew"
    }
    response = client.post("/api/scan/quick", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "threat_score" in data
    assert "threat_level" in data

def test_learning_curriculum_endpoint():
    response = client.get("/api/learning")
    assert response.status_code == 200
    data = response.json()
    assert "modules" in data
    assert len(data["modules"]) >= 3

def test_dashboard_stats_endpoint():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "user_safety_score" in data
