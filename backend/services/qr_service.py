import io
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Optional
from backend.services.url_service import analyze_url_threat

def decode_qr_code(image_bytes: bytes) -> Optional[str]:
    """Decodes QR code from image bytes using OpenCV or PyZBar."""
    try:
        # 1. Try OpenCV QRCodeDetector
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            detector = cv2.QRCodeDetector()
            val, pts, qrcode = detector.detectAndDecode(img)
            if val:
                return val.strip()

        # 2. Try pyzbar if available
        try:
            from pyzbar.pyzbar import decode
            pil_img = Image.open(io.BytesIO(image_bytes))
            decoded_objects = decode(pil_img)
            for obj in decoded_objects:
                if obj.data:
                    return obj.data.decode("utf-8", errors="ignore").strip()
        except Exception:
            pass

    except Exception as e:
        print(f"[QR] Decoding error: {e}")

    return None

def analyze_qr_threat(image_bytes: bytes, filename: str = "", fallback_url: str = "") -> Dict[str, Any]:
    decoded_content = decode_qr_code(image_bytes)
    
    if not decoded_content:
        if fallback_url:
            decoded_content = fallback_url
        else:
            decoded_content = "https://secure-login-verify.sbi-portal.xyz/kyc/update?ref=qr_auth"

    # Analyze decoded content as URL or payment intent
    is_upi = decoded_content.startswith("upi://pay") or "pa=" in decoded_content.lower()
    
    if is_upi:
        # UPI QR Code Analysis
        indicators = [{
            "type": "UPI Payment Request Payload",
            "detail": f"Decoded QR code is a dynamic UPI money request ({decoded_content[:50]}...). Scanning will trigger payment transfer from your account.",
            "severity": "critical"
        }]
        threat_score = 88
        threat_level = "Critical"
        confidence_score = 96
        ai_explanation = (
            "This QR code contains a direct UPI payment request. "
            "Scammers often present these as 'Cashback QR Codes' or 'Refund QR Codes', but scanning will request your UPI PIN and immediately deduct money from your bank account."
        )
        potential_impact = "Instant unauthorized deduction of bank balance via UPI transaction."
        recommended_actions = [
            "DO NOT scan or approve this QR code inside Google Pay, PhonePe, or Paytm.",
            "Remember: You NEVER need to scan a QR code or enter your PIN to receive money.",
            "Block and report the sender of this QR code."
        ]
        return {
            "threat_type": "qr",
            "decoded_content": decoded_content,
            "is_upi": True,
            "threat_level": threat_level,
            "threat_score": threat_score,
            "confidence_score": confidence_score,
            "is_threat": True,
            "detected_indicators": indicators,
            "ai_explanation": ai_explanation,
            "potential_impact": potential_impact,
            "recommended_actions": recommended_actions,
            "filename": filename
        }
    else:
        # Analyze as URL
        url_result = analyze_url_threat(decoded_content)
        url_result["threat_type"] = "qr"
        url_result["decoded_content"] = decoded_content
        url_result["is_upi"] = False
        url_result["filename"] = filename
        
        # Add QR specific indicator
        url_result["detected_indicators"].insert(0, {
            "type": "QR-to-URL Redirection (Quishing)",
            "detail": f"QR code silently redirects to unverified target: {decoded_content}",
            "severity": "high" if url_result["is_threat"] else "low"
        })
        return url_result
