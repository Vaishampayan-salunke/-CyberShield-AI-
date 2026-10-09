"""
CyberShield AI V2 - Multi-Model Training Pipeline
==================================================
Trains:
1. Email Threat Classifier (TF-IDF + Logistic Regression / SGD) on email_threat_detection.csv
2. SMS / WhatsApp Scam Classifier (TF-IDF + Random Forest) on SMSSpamCollection + Modern Scam vectors
3. URL Phishing Classifier (Char N-gram TF-IDF + Random Forest) on PhiUSIIL_Phishing_URL_Dataset.csv
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

os.makedirs('models', exist_ok=True)

print("=" * 60)
print("1. TRAINING EMAIL THREAT MODEL")
print("=" * 60)
try:
    df_email = pd.read_csv('Datasets/datasets/email_threat_detection.csv')
    df_email = df_email.dropna().drop_duplicates(subset=['text'])
    if len(df_email) > 30000:
        df_email = df_email.sample(30000, random_state=42)
    
    print(f"Loaded {len(df_email)} email samples.")
    X_train, X_test, y_train, y_test = train_test_split(
        df_email['text'], df_email['label'], test_size=0.15, random_state=42, stratify=df_email['label']
    )
    
    email_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=10000, stop_words='english', ngram_range=(1, 2), sublinear_tf=True)),
        ('clf', LogisticRegression(C=2.0, max_iter=1000, class_weight='balanced'))
    ])
    email_pipeline.fit(X_train, y_train)
    y_pred = email_pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Email Threat Model Accuracy: {acc * 100:.2f}%")
    
    joblib.dump(email_pipeline, 'models/email_threat_model.joblib')
    print("Saved -> models/email_threat_model.joblib")
except Exception as e:
    print(f"Error training email model: {e}")

print("\n" + "=" * 60)
print("2. TRAINING SMS / WHATSAPP SCAM MODEL")
print("=" * 60)
try:
    df_sms = pd.read_csv('Datasets/datasets/SMSSpamCollection', sep='\t', names=['label', 'message'])
    df_sms['target'] = df_sms['label'].map({'ham': 0, 'spam': 1})
    
    # Augmented modern Indian cyber security vectors
    extra_scams = [
        ('spam', 'Dear user, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210', 1),
        ('spam', 'Your SBI Bank account has been blocked due to pending KYC update. Click http://sbi-kyc-update.online to avoid deactivation', 1),
        ('spam', 'Congratulations! You have won Rs 50,000 lottery from Kaun Banega Crorepati. Contact WhatsApp manager at +918888888888', 1),
        ('spam', 'Part-time job offer! Earn Rs 3000 to 5000 daily by liking YouTube videos. Work from home. Join Telegram link: t.me/earn_fast', 1),
        ('spam', 'FedEx: Your courier parcel contains illegal contraband and is seized by customs. Call Mumbai Police cyber cell immediately', 1),
        ('spam', 'Dear customer, your card is blocked. Enter OTP 492019 to authorize refund of Rs 15,400', 1),
        ('spam', 'HDFC Alert: 5,000 reward points expiring today. Redeem cash voucher worth Rs 5,000 at http://hdfc-points-claim.net', 1),
        ('spam', 'Urgent! Pay your pending traffic e-challan of Rs 1,000 at http://echallan-pay-gov.xyz before warrant is issued', 1),
        ('spam', 'Send Rs 50 to receive Rs 5000 cashback directly in PhonePe / Google Pay wallet immediately. Scan QR code.', 1),
        ('spam', 'WhatsApp security code requested. Share 6 digit code received via SMS to secure your chat account.', 1),
        ('ham', 'Hey, are we still meeting for lunch at 1 PM today?', 0),
        ('ham', 'Your OTP for logging into your account is 482910. Valid for 10 minutes. Do not share with anyone.', 0),
        ('ham', 'Team meeting is rescheduled to tomorrow morning at 10 AM on Zoom.', 0),
        ('ham', 'Hi mom, reached home safely. Will call you in the evening.', 0),
        ('ham', 'Your Amazon order #402-9182391 has been delivered to your front door.', 0),
        ('ham', 'Can you please review the draft document before the presentation?', 0)
    ]
    df_extra = pd.DataFrame(extra_scams, columns=['label', 'message', 'target'])
    df_sms = pd.concat([df_sms, df_extra], ignore_index=True)
    
    X_train, X_test, y_train, y_test = train_test_split(
        df_sms['message'], df_sms['target'], test_size=0.15, random_state=42, stratify=df_sms['target']
    )
    
    sms_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=6000, stop_words='english', ngram_range=(1, 2))),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
    ])
    sms_pipeline.fit(X_train, y_train)
    y_pred = sms_pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"SMS Scam Model Accuracy: {acc * 100:.2f}%")
    
    joblib.dump(sms_pipeline, 'models/sms_scam_model.joblib')
    print("Saved -> models/sms_scam_model.joblib")
except Exception as e:
    print(f"Error training SMS model: {e}")

print("\n" + "=" * 60)
print("3. TRAINING URL PHISHING MODEL")
print("=" * 60)
try:
    df_url = pd.read_csv('Datasets/datasets/PhiUSIIL_Phishing_URL_Dataset.csv', nrows=35000)
    # in PhiUSIIL, label 1 is legitimate, 0 is phishing.
    # Map target: 1 = Phishing, 0 = Safe
    df_url['target'] = df_url['label'].map({0: 1, 1: 0})
    
    X_train, X_test, y_train, y_test = train_test_split(
        df_url['URL'], df_url['target'], test_size=0.15, random_state=42, stratify=df_url['target']
    )
    
    url_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), max_features=8000)),
        ('clf', RandomForestClassifier(n_estimators=70, max_depth=25, random_state=42, n_jobs=-1))
    ])
    url_pipeline.fit(X_train, y_train)
    y_pred = url_pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"URL Phishing Model Accuracy: {acc * 100:.2f}%")
    
    joblib.dump(url_pipeline, 'models/url_threat_model.joblib')
    print("Saved -> models/url_threat_model.joblib")
except Exception as e:
    print(f"Error training URL model: {e}")

meta = {
    "version": "2.0.0",
    "email_model": {"path": "models/email_threat_model.joblib", "type": "TF-IDF + Logistic Regression", "classes": ["Safe", "Threat"]},
    "sms_model": {"path": "models/sms_scam_model.joblib", "type": "TF-IDF + Random Forest", "classes": ["Ham", "Scam"]},
    "url_model": {"path": "models/url_threat_model.joblib", "type": "Char N-gram TF-IDF + Random Forest", "classes": ["Legitimate", "Phishing"]}
}
with open('models/models_meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

print("\nModel Training Complete! All artifacts saved to models/ folder.")
