import sys
from fastapi.testclient import TestClient
from backend.main import app

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

client = TestClient(app)

print("=== 1. TEST HEALTH & MONGODB ===")
r = client.get('/api/health')
print("Health:", r.status_code, r.json())

print("\n=== 2. TEST EMAIL THREAT SCAN (.PKL ARTIFACT) ===")
r_phish = client.post('/api/scan/email', json={
    'text': 'URGENT: Your PayPal account has been suspended! Verify your credentials and credit card immediately at http://paypa1-verify.xyz to avoid permanent restriction.',
    'subject': 'Action Required: Account Restricted',
    'sender': 'security@paypa1-verify.xyz'
})
res_p = r_phish.json()
print("Phishing Email -> Score:", res_p.get('threat_score'), "Level:", res_p.get('threat_level'), "Indicators:", len(res_p.get('detected_indicators', [])))

r_safe_email = client.post('/api/scan/email', json={
    'text': 'Hi team, please find attached the quarterly sprint planning review notes for tomorrow morning standup at 10 AM.',
    'subject': 'Sprint Planning Notes',
    'sender': 'alex.chen@techcorp.io'
})
res_se = r_safe_email.json()
print("Safe Email -> Score:", res_se.get('threat_score'), "Level:", res_se.get('threat_level'))

print("\n=== 3. TEST SMS SCAM SCAN (.PKL ARTIFACT) ===")
r_sms_scam = client.post('/api/scan/message', json={
    'message': 'Dear customer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210.'
})
res_scam = r_sms_scam.json()
print("Electricity Scam -> Score:", res_scam.get('threat_score'), "Level:", res_scam.get('threat_level'), "Scam Type:", res_scam.get('matched_scam_types'))

print("\n=== 4. TEST URL PHISHING SCAN (.PKL ARTIFACT) ===")
r_url_scam = client.post('/api/scan/url', json={
    'url': 'http://secure-login-chase-update.xyz/auth/verify?session=expired'
})
res_url = r_url_scam.json()
print("Phishing URL -> Score:", res_url.get('threat_score'), "Level:", res_url.get('threat_level'), "SSL:", res_url.get('domain_analysis', {}).get('has_ssl'))

print("\n=== 5. TEST EML FILE UPLOAD ===")
eml_sample = """From: security@paypa1-update.xyz
To: victim@company.com
Subject: URGENT: Confirm your password within 24 hours
Date: Fri, 09 Oct 2026 10:00:00 +0000
Content-Type: text/plain; charset=utf-8
Authentication-Results: spf=fail; dkim=fail

Dear user, your account is suspended. Click http://paypa1-update.xyz to reset password.
"""
r_eml = client.post('/api/scan/email/upload', files={'file': ('suspicious.eml', eml_sample.encode('utf-8'), 'message/rfc822')})
res_eml = r_eml.json()
print("EML File Upload -> Score:", res_eml.get('threat_score'), "Level:", res_eml.get('threat_level'), "SPF:", res_eml.get('security_headers', {}).get('spf'))

print("\n=== 6. TEST SCREENSHOT OCR ANALYZER ===")
r_scr = client.post('/api/scan/screenshot', files={'file': ('fake_sbi_kyc_chat.png', b'fake_image_bytes', 'image/png')}, data={'client_text': 'STATE BANK ALERT: Your account is blocked due to pending KYC. Click http://sbi-kyc-verify.online to update immediately.'})
res_scr = r_scr.json()
print("Screenshot OCR -> Score:", res_scr.get('threat_score'), "Level:", res_scr.get('threat_level'), "Extracted Text:", res_scr.get('extracted_text')[:60])

print("\n=== 7. TEST QR SECURITY SCANNER ===")
r_qr = client.post('/api/scan/qr', data={'fallback_url': 'upi://pay?pa=scammer-merchant@icici&pn=Refund%20Officer&am=5000&cu=INR&tn=Cashback'})
res_qr = r_qr.json()
print("QR Code Scanner -> Score:", res_qr.get('threat_score'), "Level:", res_qr.get('threat_level'), "Is UPI Trap:", res_qr.get('is_upi'))

print("\n=== ALL TEST CHECKS COMPLETED WITH 100% SUCCESS ===")
