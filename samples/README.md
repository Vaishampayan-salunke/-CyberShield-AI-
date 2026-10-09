# CyberShield AI — Test Samples & Evaluation Suite

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
