"""
CyberShield AI - QR Code Matrix Decoder & Quishing Defense Service
Decodes QR matrix barcodes and analyzes embedded payloads (URLs, UPI debit traps, WiFi payloads).
"""
import io
import cv2
import numpy as np
from typing import Dict, Any
from backend.services.url_service import analyze_url_threat

def decode_qr_image(image_bytes: bytes) -> str:
    """
    Decodes QR barcode matrix from raw image bytes using OpenCV QRCodeDetector.
    
    Args:
        image_bytes (bytes): Image binary bytes.
        
    Returns:
        str: Decoded string payload from QR matrix.
    """
    if not image_bytes:
        return ""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            detector = cv2.QRCodeDetector()
            data, bbox, _ = detector.detectAndDecode(img)
            if data:
                return data.strip()
    except Exception:
        pass
    return ""

def analyze_qr_threat(image_bytes: bytes, fallback_url: str = "") -> Dict[str, Any]:
    """
    Analyzes decoded QR payload for UPI money siphon lures, credential phishing, or quishing vectors.
    
    Args:
        image_bytes (bytes): Uploaded QR image bytes.
        fallback_url (str): Fallback URL or payload string if image decoding fails.
        
    Returns:
        Dict[str, Any]: Comprehensive QR threat analysis report.
    """
    decoded = decode_qr_image(image_bytes)
    payload = decoded or fallback_url.strip()

    if not payload:
        return {
            "threat_score": 0,
            "threat_level": "Safe",
            "confidence_score": 90,
            "decoded_content": "No QR matrix detected.",
            "is_upi": False,
            "detected_indicators": [
                {
                    "type": "No Active Payload",
                    "detail": "Could not extract valid QR matrix from provided image.",
                    "severity": "low"
                }
            ],
            "potential_impact": "No threat vectors identified in QR matrix.",
            "recommended_actions": ["Upload a clear, un-skewed QR code image."]
        }

    # Check for UPI Debit Traps (e.g. upi://pay?pa=...)
    if payload.lower().startswith("upi://pay"):
        return {
            "threat_score": 88,
            "threat_level": "Critical",
            "confidence_score": 98,
            "decoded_content": payload,
            "is_upi": True,
            "detected_indicators": [
                {
                    "type": "Malicious UPI Debit Request Trap",
                    "detail": "QR code executes a direct UPI payment siphon (upi://pay) that debits funds from your bank account.",
                    "severity": "critical"
                },
                {
                    "type": "Social Engineering Money Request",
                    "detail": "Scammers disguise debit payment requests as 'cashback rewards' or 'refund claims'.",
                    "severity": "critical"
                }
            ],
            "potential_impact": "Immediate unauthorized deduction of funds from your linked bank account.",
            "recommended_actions": [
                "DO NOT scan this QR code inside banking or UPI apps (GPay, PhonePe, Paytm).",
                "Remember: Scanning a QR code or entering your UPI PIN is NEVER required to receive money.",
                "Report merchant ID to cybercrime portal immediately."
            ]
        }

    # Evaluate as Web URL Quishing Target
    url_res = analyze_url_threat(payload)
    url_res["decoded_content"] = payload
    url_res["is_upi"] = False
    
    if url_res["threat_score"] > 30:
        url_res["detected_indicators"].insert(0, {
            "type": "Quishing (QR Phishing) Attack Vector",
            "detail": "Attackers use physical/digital QR codes to bypass traditional email filters and direct mobile devices to fraudulent portals.",
            "severity": "high"
        })
    return url_res
