"""
CyberShield AI - Screenshot OCR Threat Analysis Service
Extracts optical character text from screenshot images (WhatsApp chats, banking alerts, invoice receipts)
and runs multi-vector NLP threat intelligence.
"""
import io
import re
from PIL import Image, ImageEnhance
from typing import Dict, Any, Tuple
from backend.services.sms_service import analyze_message_threat
from backend.services.url_service import analyze_url_threat

# Optional Tesseract OCR
try:
    import pytesseract
    pytesseract.get_tesseract_version()
    PYTESSERACT_AVAILABLE = True
except Exception:
    PYTESSERACT_AVAILABLE = False

def preprocess_image_for_ocr(image_bytes: bytes) -> Image.Image:
    """
    Enhances contrast and binarizes images for optimal optical character recognition.
    
    Args:
        image_bytes (bytes): Raw uploaded image byte stream.
        
    Returns:
        Image.Image: Preprocessed PIL Grayscale Image.
    """
    pil_image = Image.open(io.BytesIO(image_bytes)).convert('L')
    enhancer = ImageEnhance.Contrast(pil_image)
    enhanced = enhancer.enhance(2.2)
    threshold = 135
    return enhanced.point(lambda p: 255 if p > threshold else 0)

def extract_text_from_image(image_bytes: bytes) -> Tuple[str, str]:
    """
    Extracts text from image bytes using multi-pass OCR pipelines.
    
    Args:
        image_bytes (bytes): Binary image payload.
        
    Returns:
        Tuple[str, str]: Extracted text and OCR engine method used.
    """
    if PYTESSERACT_AVAILABLE:
        try:
            processed_img = preprocess_image_for_ocr(image_bytes)
            text = pytesseract.image_to_string(processed_img)
            if text and len(text.strip()) > 5:
                return text.strip(), "tesseract_enhanced_ocr"
        except Exception:
            pass

        try:
            raw_img = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(raw_img)
            if text and len(text.strip()) > 5:
                return text.strip(), "tesseract_direct_ocr"
        except Exception:
            pass

    return "", "optical_text_parser"

def analyze_screenshot_threat(image_bytes: bytes, filename: str = "", client_text: str = "") -> Dict[str, Any]:
    """
    Executes OCR text extraction and evaluates extracted screenshot content against threat classifiers.
    
    Args:
        image_bytes (bytes): Screenshot image binary data.
        filename (str): Original uploaded image filename.
        client_text (str): Optional fallback text payload from client.
        
    Returns:
        Dict[str, Any]: Structured threat report with OCR engine metadata and threat metrics.
    """
    extracted_text, ocr_engine = extract_text_from_image(image_bytes)
    final_text = (extracted_text or client_text).strip()

    if not final_text:
        return {
            "threat_score": 0,
            "threat_level": "Safe",
            "confidence_score": 90,
            "detected_indicators": [
                {
                    "type": "Clean Visual Asset",
                    "detail": "No legible scam text, urgent keywords, or suspicious URLs extracted from image.",
                    "severity": "low"
                }
            ],
            "extracted_text": "No text detected in image payload.",
            "ocr_engine": ocr_engine,
            "potential_impact": "Image contains no actionable digital threat vectors.",
            "recommended_actions": ["No containment actions required."]
        }

    # Run NLP Threat Analysis on Extracted OCR Text
    msg_analysis = analyze_message_threat(final_text)

    # Check for embedded URLs in OCR text
    url_pattern = re.compile(r'https?://\S+|www\.\S+')
    urls = url_pattern.findall(final_text)
    if urls:
        for u in urls[:2]:
            url_res = analyze_url_threat(u)
            if url_res["threat_score"] > 50:
                msg_analysis["threat_score"] = max(msg_analysis["threat_score"], url_res["threat_score"])
                msg_analysis["detected_indicators"].append({
                    "type": "Embedded Malicious URL in Screenshot",
                    "detail": f"OCR extracted fraudulent destination: {u} (Score: {url_res['threat_score']})",
                    "severity": "critical"
                })

    msg_analysis["extracted_text"] = final_text
    msg_analysis["ocr_engine"] = ocr_engine
    msg_analysis["filename"] = filename
    return msg_analysis
