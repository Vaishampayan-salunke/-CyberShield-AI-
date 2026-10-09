"""
CyberShield AI V2 — Multi-Source Dataset Ingestion, Organization & ML Training Engine
=====================================================================================
Follows the exact template specifications:
- Cleans text (lowercase, url normalization, punctuation removal, whitespace stripping)
- Builds feature-rich TF-IDF vectorizers (ngram_range=(1,2), sublinear_tf=True, min_df=2)
- Trains LinearSVC / Calibrated Logistic Regression / Random Forest
- Evaluates Accuracy, Precision, Recall, F1-Score, Confusion Matrix
- Saves self-contained artifacts containing:
  {"model": ..., "vectorizer": ..., "version": "2.0", "classes": {0: "safe", 1: "threat"}}
- Saves models inside: Datasets/model/
"""

import os
import sys
import re
import json
import string
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure directories exist
DIRS = [
    'Datasets/emails',
    'Datasets/sms_messages',
    'Datasets/urls',
    'Datasets/websites',
    'Datasets/screenshots',
    'Datasets/social_engineering_jobs',
    'Datasets/model',
    'models'
]
for d in DIRS:
    os.makedirs(d, exist_ok=True)

# ─────────────────────────────────────────────────────────────
# 1. TEXT CLEANING UTILITY (User Template Code Pattern)
# ─────────────────────────────────────────────────────────────
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    # Normalize URLs & web targets
    text = re.sub(r"https?://\S+", " http_link ", text)
    text = re.sub(r"www\.\S+", " http_link ", text)
    # Remove numbers / standalone digits
    text = re.sub(r"\d+", " ", text)
    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# ─────────────────────────────────────────────────────────────
# 2. EMAIL PHISHING DATASET INGESTION & EXPANSION
# ─────────────────────────────────────────────────────────────
print("=" * 60)
print("1. INGESTING & EXPANDING EMAIL DATASETS")
print("=" * 60)

raw_email_path = 'Datasets/datasets/email_threat_detection.csv'
if not os.path.exists(raw_email_path):
    raw_email_path = 'Datasets/emails/email_threat_detection.csv'

email_records = []
if os.path.exists(raw_email_path):
    df_raw_email = pd.read_csv(raw_email_path).dropna().drop_duplicates(subset=['text'])
    # Copy to Datasets/emails
    df_raw_email.to_csv('Datasets/emails/email_threat_detection.csv', index=False)
    email_records.append(df_raw_email[['text', 'label']])
    print(f"Loaded {len(df_raw_email)} base emails from {raw_email_path}")

# Expanded Email Samples (Covering BEC, CEO fraud, DocuSign, Payroll, Tax refund, Ransomware notice, Safe internal memos)
expanded_emails = [
    # Phishing / BEC (Label 1)
    ("URGENT: Your PayPal account access has been limited due to suspicious unauthorized activity. Click http://paypa1-verify.xyz to verify your identity and credit card details within 24 hours.", 1),
    ("CONFIDENTIAL: Urgent Wire Transfer Required Today. I am currently in a closed-door executive meeting. Please process an immediate wire transfer of $48,500 to the vendor account below.", 1),
    ("DocuSign: Please review and sign Invoice #9842. You have received an urgent document for electronic signature from Accounting Dept. Links expire in 2 hours: http://docusign-auth.top/view", 1),
    ("Microsoft Office 365: Your password for corporate email expires in 2 hours. Keep your current password by verifying credentials here: http://ms-portal-auth.xyz", 1),
    ("Netflix Billing Alert: We were unable to authorize your monthly subscription renewal. Update your payment method immediately to avoid account suspension: http://netflix-update-billing.click", 1),
    ("IRS Tax Refund Notification: You are eligible to receive a tax refund of $1,420. Submit your banking and SSN information to claim your payment: http://irs-gov-refund-claim.buzz", 1),
    ("Security Alert: We detected an unrecognized login attempt from Moscow, Russia. If this was not you, reset your master credentials immediately at http://security-verify-session.net", 1),
    ("HR Department: Important update regarding employee payroll benefits and direct deposit. Please login to the new employee portal to verify bank details: http://hr-payroll-update.site", 1),
    ("Bank of America: Important security notice regarding unauthorized debit card transactions. Confirm your card PIN and CVV at http://bofa-fraud-prevention.online", 1),
    ("DHL Express: Your package delivery #DHL892019 could not be completed due to missing address info. Pay $2.99 re-delivery fee at http://dhl-express-tracking.top", 1),
    # Safe / Legitimate (Label 0)
    ("Hi Team, please find attached the quarterly sprint planning notes for review before tomorrow morning standup at 10:00 AM.", 0),
    ("Quarterly Engineering Roadmap: Attached is the revised architecture blueprint for database sharding and latency improvements.", 0),
    ("Meeting Notes: Summary of discussion regarding Q4 budget allocations, hiring targets, and team performance milestones.", 0),
    ("Hi Alex, thanks for sending over the project documentation. I have reviewed the pull request and left comments on GitHub.", 0),
    ("Your Amazon order #402-9182391 has been dispatched and will arrive by tomorrow evening. Track your package in the official app.", 0),
    ("Weekly newsletter: Tech trends, open source updates, and security best practices for cloud native applications.", 0),
    ("Team lunch reminder: We are celebrating Sarah's promotion this Friday at 1:00 PM at the downtown cafe. See you all there!", 0),
    ("Google Calendar: Invitation for Design Sync with product team on Wednesday at 3:00 PM on Google Meet.", 0),
    ("Automated Build Notification: CI/CD Pipeline build #492 passed all automated unit and integration tests successfully.", 0),
    ("Hi Mom, landed safely at the airport and checking in to the hotel now. Will call you once I unpack.", 0)
]
df_extra_email = pd.DataFrame(expanded_emails, columns=['text', 'label'])
df_extra_email.to_csv('Datasets/emails/phishing_email_corpus_expanded.csv', index=False)
email_records.append(df_extra_email)

df_all_emails = pd.concat(email_records, ignore_index=True).dropna().drop_duplicates(subset=['text'])
df_all_emails.to_csv('Datasets/emails/combined_emails_master.csv', index=False)
print(f"Total Combined Email Dataset: {len(df_all_emails)} samples. Labels: {df_all_emails['label'].value_counts().to_dict()}")

# Train Email Model
df_email_sample = df_all_emails.sample(min(30000, len(df_all_emails)), random_state=42)
df_email_sample['clean_text'] = df_email_sample['text'].apply(clean_text)

X_train, X_test, y_train, y_test = train_test_split(
    df_email_sample['clean_text'], df_email_sample['label'],
    test_size=0.20, random_state=42, stratify=df_email_sample['label']
)

email_vectorizer = TfidfVectorizer(max_features=6000, stop_words="english", ngram_range=(1, 2), sublinear_tf=True, min_df=2)
X_train_vec = email_vectorizer.fit_transform(X_train)
X_test_vec = email_vectorizer.transform(X_test)

# Train Calibrated LinearSVC / Logistic Regression
base_svc = LinearSVC(C=1.0, max_iter=2000, random_state=42)
email_model = CalibratedClassifierCV(base_svc)
email_model.fit(X_train_vec, y_train)

y_pred = email_model.predict(X_test_vec)
email_acc = accuracy_score(y_test, y_pred)
email_p = precision_score(y_test, y_pred)
email_r = recall_score(y_test, y_pred)
email_f1 = f1_score(y_test, y_pred)
print(f"Email Model — Accuracy: {email_acc*100:.2f}%, Precision: {email_p*100:.2f}%, Recall: {email_r*100:.2f}%, F1: {email_f1*100:.2f}%")

# Save Email Model Artifact
email_artifact = {
    "model": email_model,
    "vectorizer": email_vectorizer,
    "version": "2.0",
    "classes": {0: "safe", 1: "phishing"}
}
joblib.dump(email_artifact, 'Datasets/model/email_threat_model.pkl')
joblib.dump(email_artifact, 'models/email_threat_model.joblib')
print("Email model saved to Datasets/model/email_threat_model.pkl")

# ─────────────────────────────────────────────────────────────
# 3. SMS, WHATSAPP & SMISHING DATASET INGESTION & TRAINING
# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("2. INGESTING & EXPANDING SMS / WHATSAPP SCAM DATASETS")
print("=" * 60)

raw_sms_path = 'Datasets/datasets/SMSSpamCollection'
if not os.path.exists(raw_sms_path):
    raw_sms_path = 'Datasets/sms_messages/SMSSpamCollection'

sms_records = []
if os.path.exists(raw_sms_path):
    df_raw_sms = pd.read_csv(raw_sms_path, sep='\t', names=['label_str', 'text'])
    df_raw_sms['label'] = df_raw_sms['label_str'].map({'ham': 0, 'spam': 1})
    df_raw_sms[['text', 'label']].to_csv('Datasets/sms_messages/SMSSpamCollection.tsv', sep='\t', index=False)
    sms_records.append(df_raw_sms[['text', 'label']])
    print(f"Loaded {len(df_raw_sms)} base messages from {raw_sms_path}")

# Multi-lingual & Indian Scam Smishing Dataset (UPI, Electricity bill cut, KYC bank block, KBC lottery, Telegram task, FedEx extortion)
indian_scams = [
    # Scams (Label 1)
    ("Dear user, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call electricity officer immediately at 9876543210.", 1),
    ("Your SBI Bank account has been blocked due to pending KYC update. Click http://sbi-kyc-update.online to avoid permanent deactivation within 12 hours.", 1),
    ("Congratulations! Your mobile number won Rs 25,00,000 lottery in Kaun Banega Crorepati lucky draw. Contact WhatsApp manager at +918888888888.", 1),
    ("Part-time job offer! Earn Rs 3,000 to 5,000 daily from home by liking YouTube videos. No investment needed. Join Telegram: t.me/fast_daily_earn", 1),
    ("FedEx Alert: Your courier parcel contains contraband narcotics and is seized by customs. Call Mumbai Police Cyber Cell immediately at 9812345678.", 1),
    ("HDFC Bank Alert: 5,000 reward points expiring today. Redeem cash voucher of Rs 5,000 immediately at http://hdfc-points-claim.net", 1),
    ("Dear customer, your card is blocked. Enter OTP 492019 to authorize refund of Rs 15,400 directly into your bank account.", 1),
    ("Traffic Police Alert: Pending e-challan of Rs 1,000 against vehicle. Pay immediately at http://echallan-pay-gov.xyz before warrant is issued.", 1),
    ("PhonePe Reward: You have received Rs 5,000 cashback voucher! Scan QR code and enter UPI PIN to claim money in your account.", 1),
    ("WhatsApp security alert: Your WhatsApp 6-digit code was requested. Share code with customer support to prevent account termination.", 1),
    ("Aapka electricity bill overdue hai. Aaj raat 9:30 baje bijli kaat di jayegi. Turant call kare officer ko 9876543210 par.", 1),
    ("SBI YONO Alert: Aapka account KYC expire ho gaya hai. Abhi update kare http://sbi-pan-update.com nahi toh account band ho jayega.", 1),
    ("Ghar baithe kamaye 5000 daily. YouTube video like karo aur paise kamao. Telegram join kare abhi t.me/earnmoneyfast", 1),
    ("Income Tax Refund of Rs 24,800 is approved. Please confirm your bank account number and IFSC at http://incometax-refund-gov.online", 1),
    # Safe / Legitimate (Label 0)
    ("Hey, are we still meeting for dinner at 7:30 PM today? Let me know so I can reserve a table.", 0),
    ("Your OTP for logging into your account is 482910. Valid for 10 minutes. Do not share with anyone.", 0),
    ("Hi Dad, reached college safely. Will call you after classes in the evening.", 0),
    ("Team meeting has been rescheduled to tomorrow morning at 10 AM on Google Meet.", 0),
    ("Your Swiggy order #98421 has been picked up and will be delivered in 15 minutes.", 0),
    ("Can you please send me the class notes for yesterday's computer science lecture?", 0),
    ("Hi, just checking in to see if you are free this weekend for a quick coffee catchup?", 0),
    ("Your Uber driver is arriving in a White Swift Dzire (KA-01-AB-1234).", 0),
    ("Bank Alert: Your account was credited with Rs 5,000 via UPI from Rahul Sharma on 09-Oct-2026. Available balance: Rs 42,150.", 0),
    ("Package delivered: Your Amazon package was handed to resident.", 0)
]
df_extra_sms = pd.DataFrame(indian_scams, columns=['text', 'label'])
df_extra_sms.to_csv('Datasets/sms_messages/indian_scam_smishing_corpus.csv', index=False)
sms_records.append(df_extra_sms)

df_all_sms = pd.concat(sms_records, ignore_index=True).dropna().drop_duplicates(subset=['text'])
df_all_sms.to_csv('Datasets/sms_messages/combined_sms_master.csv', index=False)
print(f"Total Combined SMS/WhatsApp Dataset: {len(df_all_sms)} samples. Labels: {df_all_sms['label'].value_counts().to_dict()}")

# Train SMS Model
df_all_sms['clean_text'] = df_all_sms['text'].apply(clean_text)
X_train, X_test, y_train, y_test = train_test_split(
    df_all_sms['clean_text'], df_all_sms['label'],
    test_size=0.20, random_state=42, stratify=df_all_sms['label']
)

sms_vectorizer = TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 2), sublinear_tf=True, min_df=2)
X_train_vec = sms_vectorizer.fit_transform(X_train)
X_test_vec = sms_vectorizer.transform(X_test)

sms_model = RandomForestClassifier(n_estimators=100, max_depth=20, random_state=42, class_weight='balanced')
sms_model.fit(X_train_vec, y_train)

y_pred = sms_model.predict(X_test_vec)
sms_acc = accuracy_score(y_test, y_pred)
sms_p = precision_score(y_test, y_pred)
sms_r = recall_score(y_test, y_pred)
sms_f1 = f1_score(y_test, y_pred)
print(f"SMS Scam Model — Accuracy: {sms_acc*100:.2f}%, Precision: {sms_p*100:.2f}%, Recall: {sms_r*100:.2f}%, F1: {sms_f1*100:.2f}%")

sms_artifact = {
    "model": sms_model,
    "vectorizer": sms_vectorizer,
    "version": "2.0",
    "classes": {0: "ham", 1: "scam"}
}
joblib.dump(sms_artifact, 'Datasets/model/sms_scam_model.pkl')
joblib.dump(sms_artifact, 'models/sms_scam_model.joblib')
print("SMS model saved to Datasets/model/sms_scam_model.pkl")

# ─────────────────────────────────────────────────────────────
# 4. MALICIOUS URL & WEBSITE PHISHING DATASET & TRAINING
# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("3. INGESTING & TRAINING MALICIOUS URL / WEBSITE DATASETS")
print("=" * 60)

raw_url_path = 'Datasets/datasets/PhiUSIIL_Phishing_URL_Dataset.csv'
if not os.path.exists(raw_url_path):
    raw_url_path = 'Datasets/urls/PhiUSIIL_Phishing_URL_Dataset.csv'

url_records = []
if os.path.exists(raw_url_path):
    df_raw_url = pd.read_csv(raw_url_path, nrows=40000)
    # in PhiUSIIL, 1 is legitimate, 0 is phishing.
    # Map target: 1 = Phishing, 0 = Safe
    df_raw_url['target'] = df_raw_url['label'].map({0: 1, 1: 0})
    df_raw_url.to_csv('Datasets/urls/PhiUSIIL_Phishing_URL_Dataset.csv', index=False)
    url_records.append(df_raw_url[['URL', 'target']].rename(columns={'URL': 'url', 'target': 'label'}))
    print(f"Loaded {len(df_raw_url)} base URLs from {raw_url_path}")

# Typosquatting and targeted brand spoofing URLs
synthetic_urls = [
    # Phishing (Label 1)
    ("http://secure-login-chase-update.xyz/auth/verify?session=expired", 1),
    ("http://paypa1-security-verify.top/account/confirm", 1),
    ("http://appleid.apple-support-auth.club/signin/index.php", 1),
    ("http://sbi-yono-kyc-update.online/netbanking/login", 1),
    ("http://192.168.1.104/banking/hdfc/login.html", 1),
    ("https://bit.ly/3xX9Q1a-urgent-tax-refund-claim", 1),
    ("http://netflix-billing-renewal.buzz/auth/payment", 1),
    ("http://facebook-security-checkpoint.work/checkpoint/verify", 1),
    ("http://binance-wallet-recovery.fit/login", 1),
    ("http://amazon-prime-account-suspended.gq/signin", 1),
    # Legitimate (Label 0)
    ("https://en.wikipedia.org/wiki/Computer_security", 0),
    ("https://github.com/torvalds/linux", 0),
    ("https://www.google.com/search?q=cybersecurity+best+practices", 0),
    ("https://aws.amazon.com/security", 0),
    ("https://www.microsoft.com/en-us/security", 0),
    ("https://stackoverflow.com/questions/tagged/python", 0),
    ("https://www.paypal.com/us/home", 0),
    ("https://www.onlinesbi.sbi", 0),
    ("https://www.hdfcbank.com", 0),
    ("https://cybercrime.gov.in", 0)
]
df_extra_url = pd.DataFrame(synthetic_urls, columns=['url', 'label'])
df_extra_url.to_csv('Datasets/urls/typosquatting_and_malicious_urls.csv', index=False)
url_records.append(df_extra_url)

df_all_urls = pd.concat(url_records, ignore_index=True).dropna().drop_duplicates(subset=['url'])
df_all_urls.to_csv('Datasets/urls/combined_urls_master.csv', index=False)
print(f"Total Combined URL Dataset: {len(df_all_urls)} samples. Labels: {df_all_urls['label'].value_counts().to_dict()}")

# Train URL Model using Char N-Gram TF-IDF
X_train, X_test, y_train, y_test = train_test_split(
    df_all_urls['url'], df_all_urls['label'],
    test_size=0.20, random_state=42, stratify=df_all_urls['label']
)

url_vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), max_features=8000, sublinear_tf=True)
X_train_vec = url_vectorizer.fit_transform(X_train)
X_test_vec = url_vectorizer.transform(X_test)

url_model = RandomForestClassifier(n_estimators=75, max_depth=25, random_state=42, n_jobs=-1)
url_model.fit(X_train_vec, y_train)

y_pred = url_model.predict(X_test_vec)
url_acc = accuracy_score(y_test, y_pred)
url_p = precision_score(y_test, y_pred)
url_r = recall_score(y_test, y_pred)
url_f1 = f1_score(y_test, y_pred)
print(f"URL Phishing Model — Accuracy: {url_acc*100:.2f}%, Precision: {url_p*100:.2f}%, Recall: {url_r*100:.2f}%, F1: {url_f1*100:.2f}%")

url_artifact = {
    "model": url_model,
    "vectorizer": url_vectorizer,
    "version": "2.0",
    "classes": {0: "legitimate", 1: "phishing"}
}
joblib.dump(url_artifact, 'Datasets/model/url_threat_model.pkl')
joblib.dump(url_artifact, 'models/url_threat_model.joblib')
print("URL model saved to Datasets/model/url_threat_model.pkl")

# ─────────────────────────────────────────────────────────────
# 5. FAKE JOB OFFERS & SOCIAL ENGINEERING MODEL & DATASET
# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("4. INGESTING & TRAINING FAKE JOB / SOCIAL ENGINEERING DATASET")
print("=" * 60)

job_scam_data = [
    # Fraudulent Job Postings (Label 1)
    ("Urgent hiring! Work from home part-time assistant. Earn Rs 40,000 to 60,000 monthly. Pay refundable registration fee of Rs 999 to start training today.", 1),
    ("Data entry operator required. Earn Rs 2500 per day. No experience or resume required. WhatsApp HR manager at +919876543210 to book slot.", 1),
    ("Selected for Senior Project Manager role at Amazon! Deposit $250 laptop security clearance deposit via crypto or Western Union to receive onboarding packet.", 1),
    ("Like YouTube videos and earn Rs 500 per video. Daily payout via Google Pay. Contact Telegram recruiter @earn_fast_jobs.", 1),
    ("Government Secretariat recruitment 2026. Direct appointment without exam. Pay processing fee of Rs 5,000 to secure hall ticket.", 1),
    ("International Hotel Staff required in Canada. Guaranteed visa and air tickets. Send passport copy and $500 document legalization charge.", 1),
    # Authentic Job Postings (Label 0)
    ("Senior Software Engineer (Full Stack) — Requirements: 5+ years experience with React, Python, Distributed Systems. Competitive salary and comprehensive benefits.", 0),
    ("Data Scientist at Fintech Corp — Seeking candidate with strong background in PyTorch, SQL, and NLP. Apply through company official careers portal.", 0),
    ("Cybersecurity SOC Analyst Tier 1 — Responsibilities include monitoring SIEM alerts, incident triage, and vulnerability management. Bachelor's in CS required.", 0),
    ("Frontend Developer (React/Next.js) — Build responsive web applications with TypeScript and Tailwind CSS. Review our engineering blog for more details.", 0),
    ("Product Designer — Collaborate with cross-functional teams to design enterprise SaaS interfaces. Portfolio submission required during application.", 0),
    ("DevOps Engineer — Manage Kubernetes clusters, Terraform infrastructure, and CI/CD pipelines in AWS/GCP.", 0)
]
df_jobs = pd.DataFrame(job_scam_data, columns=['text', 'label'])
df_jobs.to_csv('Datasets/social_engineering_jobs/fake_job_postings_dataset.csv', index=False)

job_vec = TfidfVectorizer(max_features=2000, ngram_range=(1, 2))
X_job_vec = job_vec.fit_transform(df_jobs['text'])
job_clf = LogisticRegression()
job_clf.fit(X_job_vec, df_jobs['label'])

job_artifact = {
    "model": job_clf,
    "vectorizer": job_vec,
    "version": "2.0",
    "classes": {0: "legitimate", 1: "fraudulent"}
}
joblib.dump(job_artifact, 'Datasets/model/job_scam_model.pkl')
joblib.dump(job_artifact, 'models/job_scam_model.joblib')
print("Job scam model saved to Datasets/model/job_scam_model.pkl")

# ─────────────────────────────────────────────────────────────
# 6. DATASET INVENTORY & PROVENANCE REPORT GENERATION
# ─────────────────────────────────────────────────────────────
inventory_md = f"""# 📚 CyberShield AI V2 — Dataset Inventory & Provenance Report

Generated on: 2026-10-09

## 🗂️ Category Folder Structure
- `Datasets/emails/`: Email phishing, spam, and corporate email corpora
- `Datasets/sms_messages/`: SMS, WhatsApp, and multilingual smishing datasets
- `Datasets/urls/`: Phishing URLs, brand typosquatting, and safe URL databases
- `Datasets/websites/`: Structured HTML and domain feature datasets
- `Datasets/social_engineering_jobs/`: Fraudulent job offer detection and social engineering lures
- `Datasets/screenshots/`: OCR extraction annotations and sample scam chat images
- `Datasets/model/`: Serialized ML model artifacts (`.pkl` and `.joblib`)

---

## 📊 Dataset Specifications & Training Metrics

### 1. Email Threat Classification
- **Dataset Files**: `Datasets/emails/combined_emails_master.csv`, `email_threat_detection.csv`, `phishing_email_corpus_expanded.csv`
- **Total Samples**: {len(df_all_emails):,}
- **Labels**: `0 = Safe / Legitimate`, `1 = Phishing / Spam`
- **Model Architecture**: TF-IDF Vectorizer (N-Gram 1-2, sublinear_tf=True) + Calibrated LinearSVC
- **Evaluation**: Accuracy: **{email_acc*100:.2f}%** | Precision: **{email_p*100:.2f}%** | Recall: **{email_r*100:.2f}%** | F1: **{email_f1*100:.2f}%**
- **Saved Model**: `Datasets/model/email_threat_model.pkl`

### 2. SMS & WhatsApp Scam Classifier
- **Dataset Files**: `Datasets/sms_messages/combined_sms_master.csv`, `SMSSpamCollection.tsv`, `indian_scam_smishing_corpus.csv`
- **Total Samples**: {len(df_all_sms):,}
- **Labels**: `0 = Ham / Legitimate`, `1 = Scam / Extortion`
- **Model Architecture**: TF-IDF Vectorizer + Random Forest (100 Trees, class_weight='balanced')
- **Evaluation**: Accuracy: **{sms_acc*100:.2f}%** | Precision: **{sms_p*100:.2f}%** | Recall: **{sms_r*100:.2f}%** | F1: **{sms_f1*100:.2f}%**
- **Saved Model**: `Datasets/model/sms_scam_model.pkl`

### 3. URL & Website Phishing Sentry
- **Dataset Files**: `Datasets/urls/combined_urls_master.csv`, `PhiUSIIL_Phishing_URL_Dataset.csv`, `typosquatting_and_malicious_urls.csv`
- **Total Samples**: {len(df_all_urls):,}
- **Labels**: `0 = Legitimate`, `1 = Phishing / Malicious`
- **Model Architecture**: Character N-gram TF-IDF (3-5 chars) + Random Forest Classifier (75 Trees)
- **Evaluation**: Accuracy: **{url_acc*100:.2f}%** | Precision: **{url_p*100:.2f}%** | Recall: **{url_r*100:.2f}%** | F1: **{url_f1*100:.2f}%**
- **Saved Model**: `Datasets/model/url_threat_model.pkl`

### 4. Fake Job Offer & Social Engineering Classifier
- **Dataset Files**: `Datasets/social_engineering_jobs/fake_job_postings_dataset.csv`
- **Labels**: `0 = Legitimate`, `1 = Fraudulent`
- **Saved Model**: `Datasets/model/job_scam_model.pkl`

---
*All models are packaged with vectorizers and class mappings for immediate inference in production.*
"""

with open('Datasets/DATASET_INVENTORY.md', 'w', encoding='utf-8') as f:
    f.write(inventory_md)

print("\n" + "=" * 60)
print("SUCCESS: All datasets categorized, models trained, and inventory report created at Datasets/DATASET_INVENTORY.md!")
print("=" * 60)
