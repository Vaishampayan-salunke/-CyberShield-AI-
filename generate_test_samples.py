"""
Script to generate categorized sample datasets and test artifacts for CyberShield AI.
Creates realistic .eml, .txt, QR code .png images, and screenshot .png images
for judge evaluations and multi-vector threat testing.
"""
import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")

os.makedirs(os.path.join(SAMPLES_DIR, "emails"), exist_ok=True)
os.makedirs(os.path.join(SAMPLES_DIR, "sms_messages"), exist_ok=True)
os.makedirs(os.path.join(SAMPLES_DIR, "urls"), exist_ok=True)
os.makedirs(os.path.join(SAMPLES_DIR, "qr_codes"), exist_ok=True)
os.makedirs(os.path.join(SAMPLES_DIR, "screenshots"), exist_ok=True)

# 1. EMAILS
emails = {
    "paypal_credential_phishing.eml": """From: PayPal Security <security-service@paypa1-support.com>
To: target-victim@corp.com
Subject: Urgent: Your account access has been limited
Date: Fri, 09 Oct 2026 09:30:00 +0000
Message-ID: <pay-alert-99214@paypa1-support.com>
Authentication-Results: mx.google.com; spf=fail (google.com: domain of security-service@paypa1-support.com does not designate permitted sender); dkim=fail; dmarc=fail
Received-SPF: fail (domain of paypa1-support.com does not designate permitted sender)
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Dear Valued Customer,

We detected unauthorized sign-in attempts to your PayPal account from an unrecognized device in Moscow, Russia.
For your safety, your account features and credit card privileges have been temporarily restricted.

To restore your access, you are required to confirm your identity and billing credentials within 24 hours:
http://paypa1-security-verify.xyz/login/auth?token=89234198234

Failure to verify within the deadline will result in permanent account termination.

Sincerely,
PayPal Risk & Fraud Prevention Department
""",
    "ceo_wire_transfer_bec.eml": """From: Arthur Pendelton <ceo-office@company-corp.com>
To: finance-payroll@company-corp.com
Subject: CONFIDENTIAL: Urgent Wire Transfer Required Today
Date: Fri, 09 Oct 2026 10:15:00 +0000
Message-ID: <bec-98234@company-corp.com>
Authentication-Results: mx.google.com; spf=softfail; dkim=none
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi,

I am currently in a confidential executive board meeting and cannot take calls. We have closed an urgent international supplier contract that requires an immediate wire transfer of $48,500.

Please wire this sum immediately to the beneficiary account below:
Bank: Offshore Global Trust
Account Name: Apex International Holdings
Routing: 021000021
Account No: 98421098234

Send me the transfer confirmation receipt as soon as processed. Do not discuss this with other staff until public disclosure.

Best regards,
Arthur Pendelton | Chief Executive Officer
""",
    "docusign_invoice_malware.eml": """From: DocuSign Notification <docusign-notifications@service-docu-sign.top>
To: accounting@business.com
Subject: DocuSign: Please review and sign Invoice #9842
Date: Fri, 09 Oct 2026 11:00:00 +0000
Message-ID: <doc-88123@service-docu-sign.top>
Authentication-Results: mx.google.com; spf=fail; dkim=fail
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

DocuSign Envelope Notification

You have received an electronic document for mandatory digital signature.
Document: Q3_Vendor_Invoice_9842.pdf
Sender: Corporate Accounts Payable

Please review and sign your document here:
https://docusign-auth-portal.top/view/doc?id=984218&auth=true

Warning: Signature link expires in 2 hours.
""",
    "safe_quarterly_sprint_review.eml": """From: Alex Chen <alex.chen@techcorp.io>
To: engineering-team@techcorp.io
Subject: Quarterly Sprint Planning & Architecture Review
Date: Fri, 09 Oct 2026 08:00:00 +0000
Message-ID: <sprint-2026-q3@techcorp.io>
Authentication-Results: mx.google.com; spf=pass (google.com: domain of alex.chen@techcorp.io designates 192.0.2.1 as permitted sender); dkim=pass header.i=@techcorp.io; dmarc=pass
Received-SPF: pass (google.com: domain of techcorp.io designates 192.0.2.1 as permitted sender)
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi Team,

Attached is our proposed technical roadmap for the upcoming sprint. Please review the service latency optimizations and database sharding proposal before our planning session on Thursday at 10:00 AM.

Agenda:
1. Microservice API Gateway latency profiling
2. Database index performance tuning
3. Next sprint deliverables & story estimates

Let me know if you have any questions or agenda additions.

Thanks,
Alex Chen | Engineering Lead
TechCorp Inc.
"""
}

for fname, content in emails.items():
    with open(os.path.join(SAMPLES_DIR, "emails", fname), "w", encoding="utf-8") as f:
        f.write(content)

# 2. SMS & WHATSAPP SAMPLES
sms_samples = {
    "electricity_disconnection_scam.txt": "Dear customer, your electricity power will be disconnected tonight at 9:30 PM from the power sub-station due to unpaid previous month bill. Please contact our electricity officer Mr. Sharma immediately at 9876543210 to avoid disconnection.",
    "sbi_kyc_account_blocked.txt": "Your SBI Bank account has been temporarily blocked due to pending KYC document update. Click http://sbi-kyc-update.online to submit your Aadhaar and PAN details to avoid permanent deactivation within 12 hours.",
    "youtube_work_from_home_fraud.txt": "Part-time job offer! Earn ₹3,000 to ₹5,000 daily from home by simply liking YouTube videos and rating Google maps places. No experience needed. Daily instant payout. Join official Telegram channel: https://t.me/fast_daily_earn_vip",
    "fedex_customs_contraband_extortion.txt": "FedEx Alert: Your international parcel #FX98234 contains illegal narcotics and has been intercepted by customs. Call Mumbai Police Cyber Crime Cell immediately at +91-9812345678 to clear charges and avoid non-bailable arrest warrant.",
    "kbc_lottery_prize_scam.txt": "Congratulations! Your mobile number has won ₹25,00,000 cash prize in Kaun Banega Crorepati (KBC) Lucky Draw 2026. Contact KBC manager WhatsApp at +91-8888888888 with ticket number #KBC9921 to claim your reward.",
    "safe_personal_chat.txt": "Hey! Are we still meeting for the team lunch at 1:00 PM today? Let me know so I can reserve a table for six people at the cafe."
}

for fname, content in sms_samples.items():
    with open(os.path.join(SAMPLES_DIR, "sms_messages", fname), "w", encoding="utf-8") as f:
        f.write(content)

# 3. URLS
url_samples = {
    "malicious_and_phishing_urls.txt": """# List of Phishing, Typosquatting, and Malicious Test URLs
http://secure-chase-update-login.xyz/banking/auth?session=expired
http://appleid.apple-support-auth.top/signin/index.php
http://sbi-yono-kyc-update.online/netbanking/login
https://bit.ly/3xX9Q1a-urgent-tax-refund
http://paypa1-security-verify.xyz/login/auth
http://192.168.1.150/admin-login/account-verify.php
http://netflix-billing-suspended.club/renew
http://wellsfargo-secure-verification.info/signin
""",
    "safe_legitimate_urls.txt": """# List of Legitimate and Safe Test URLs
https://en.wikipedia.org/wiki/Computer_security
https://github.com/torvalds/linux
https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx
https://www.paypal.com/signin
https://www.chase.com
https://developer.mozilla.org/en-US/docs/Web/Security
https://www.google.com
"""
}

for fname, content in url_samples.items():
    with open(os.path.join(SAMPLES_DIR, "urls", fname), "w", encoding="utf-8") as f:
        f.write(content)

# 4. QR CODES (Real high-res PNG images)
qr_specs = [
    {
        "filename": "upi_money_debit_trap_qr.png",
        "data": "upi://pay?pa=scammer-merchant@icici&pn=Refund%20Officer&am=5000&cu=INR&tn=UPI%20Cashback%20Reward",
        "label": "UPI Money Debit Trap (₹5,000 Extortion)"
    },
    {
        "filename": "quishing_phishing_url_qr.png",
        "data": "https://secure-login-verify.sbi-portal.xyz/kyc/update?ref=qr_auth",
        "label": "Quishing Phishing Login URL"
    },
    {
        "filename": "crypto_giveaway_scam_qr.png",
        "data": "https://bitcoin-doubler-giveaway.club/claim?wallet=0x9482104812",
        "label": "Cryptocurrency Giveaway Trap"
    },
    {
        "filename": "safe_gov_cybercrime_portal_qr.png",
        "data": "https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx",
        "label": "Legitimate Cybercrime Portal"
    },
    {
        "filename": "safe_wifi_guest_access_qr.png",
        "data": "WIFI:S:TechCorp-Guest;T:WPA;P:SecureWelcome2026;;",
        "label": "Safe Corporate WiFi Connection"
    }
]

for item in qr_specs:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(item["data"])
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    out_path = os.path.join(SAMPLES_DIR, "qr_codes", item["filename"])
    img.save(out_path)

# 5. SCREENSHOTS (Generated realistic UI chat / alert screenshots)
def create_mock_screenshot(filename, header_title, sender, message, bg_color=(15, 23, 42), bubble_color=(30, 41, 59), text_color=(241, 245, 249)):
    width, height = 600, 400
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Header bar
    draw.rectangle([0, 0, width, 60], fill=(2, 6, 23))
    draw.text((20, 20), header_title, fill=(56, 189, 248))
    
    # Subheader / Sender
    draw.rectangle([20, 80, width - 20, 115], fill=(15, 23, 42))
    draw.text((30, 90), f"Sender: {sender}", fill=(148, 163, 184))
    
    # Message bubble
    draw.rounded_rectangle([20, 130, width - 20, 340], radius=16, fill=bubble_color, outline=(51, 65, 85), width=2)
    
    # Wrap message text manually
    words = message.split(' ')
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(' '.join(current_line)) > 42:
            current_line.pop()
            lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
        
    y = 150
    for line in lines:
        draw.text((40, y), line, fill=text_color)
        y += 24
        
    # Timestamp
    draw.text((width - 120, 310), "10:45 AM  ✓✓", fill=(100, 116, 139))
    
    out_path = os.path.join(SAMPLES_DIR, "screenshots", filename)
    img.save(out_path)

create_mock_screenshot(
    "electricity_disconnection_sms_screenshot.png",
    "💬 Messages • Electricity Board Notice",
    "VM-POWERCUT",
    "Dear customer, your electricity power will be disconnected tonight at 9:30 PM from the power sub-station due to unpaid previous month bill. Call our electricity officer Mr. Sharma immediately at 9876543210 to avoid power cut.",
    bubble_color=(45, 20, 20),
    text_color=(254, 202, 202)
)

create_mock_screenshot(
    "sbi_kyc_blocked_alert_screenshot.png",
    "📱 Mobile Banking Notification",
    "SBI-ALERT",
    "STATE BANK ALERT: Your YONO NetBanking access is blocked today due to pending KYC PAN verification. Login to http://sbi-kyc-update.online to submit your Aadhaar details within 12 hours.",
    bubble_color=(50, 25, 10),
    text_color=(254, 215, 170)
)

create_mock_screenshot(
    "telegram_part_time_job_screenshot.png",
    "✈️ Telegram Messenger",
    "Recruitment HR Coordinator",
    "Part-time job offer! Earn ₹3,000 to ₹5,000 daily from home by simply liking YouTube videos. No experience required. Instant UPI daily payout. Contact Telegram: @fast_daily_earn_vip",
    bubble_color=(20, 35, 55),
    text_color=(186, 230, 253)
)

create_mock_screenshot(
    "safe_team_lunch_screenshot.png",
    "💬 WhatsApp Chat",
    "Sarah Jenkins (Project Manager)",
    "Hey! Are we still meeting for the quarterly team planning lunch at 1:00 PM today? Let me know so I can reserve a table for six at the bistro.",
    bubble_color=(15, 45, 30),
    text_color=(187, 247, 208)
)

# 6. WRITE SAMPLES INVENTORY / README
inventory_md = """# CyberShield AI — Test Samples & Evaluation Suite

This directory contains testing benchmarks across all multi-vector cybersecurity engines. Use these files to upload and test every detection capability during hackathon evaluations.

---

## Folder Structure

```
samples/
├── emails/                     # .eml and .txt phishing emails with SPF/DKIM headers
│   ├── paypal_credential_phishing.eml
│   ├── ceo_wire_transfer_bec.eml
│   ├── docusign_invoice_malware.eml
│   └── safe_quarterly_sprint_review.eml
├── sms_messages/               # Real-world smishing, power cuts, KYC blocks
│   ├── electricity_disconnection_scam.txt
│   ├── sbi_kyc_account_blocked.txt
│   ├── youtube_work_from_home_fraud.txt
│   ├── fedex_customs_contraband_extortion.txt
│   ├── kbc_lottery_prize_scam.txt
│   └── safe_personal_chat.txt
├── urls/                       # Typosquatting, deceptive domains & clean URLs
│   ├── malicious_and_phishing_urls.txt
│   └── safe_legitimate_urls.txt
├── qr_codes/                   # Real Scannable PNG QR code images
│   ├── upi_money_debit_trap_qr.png          (upi://pay money siphon trap)
│   ├── quishing_phishing_url_qr.png         (Credential phishing URL)
│   ├── crypto_giveaway_scam_qr.png          (Cryptocurrency fraud link)
│   ├── safe_gov_cybercrime_portal_qr.png    (Legitimate cybercrime portal)
│   └── safe_wifi_guest_access_qr.png        (Safe WiFi configuration)
└── screenshots/                # Realistic mobile alert & chat screenshots
    ├── electricity_disconnection_sms_screenshot.png
    ├── sbi_kyc_blocked_alert_screenshot.png
    ├── telegram_part_time_job_screenshot.png
    └── safe_team_lunch_screenshot.png
```

---

## How to Test

1. **Email Analyzer:** Upload any file from `samples/emails/` or copy the raw content into the analyzer.
2. **SMS & WhatsApp Scanner:** Copy text from `samples/sms_messages/` into the message input.
3. **URL Scanner:** Test any URL from `samples/urls/`.
4. **QR Code Scanner:** Upload any `.png` QR code from `samples/qr_codes/` or drag & drop.
5. **Screenshot Analyzer:** Upload any `.png` screenshot from `samples/screenshots/` to run optical character recognition (OCR) and NLP threat extraction.
"""

with open(os.path.join(SAMPLES_DIR, "README.md"), "w", encoding="utf-8") as f:
    f.write(inventory_md)

print("Test samples generated successfully in", SAMPLES_DIR)
