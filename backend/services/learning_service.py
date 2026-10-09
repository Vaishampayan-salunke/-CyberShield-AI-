from typing import List, Dict, Any

LEARNING_MODULES: List[Dict[str, Any]] = [
    {
        "id": "phishing-awareness",
        "title": "Phishing & Spear Phishing Defense",
        "category": "Email Security",
        "level": "Beginner to Advanced",
        "estimated_time": "5 min",
        "badge": "Email Armor",
        "summary": "Learn how modern cybercriminals craft deceptive emails that mimic authentic brands, fake boss requests (BEC), and invoice lures.",
        "key_takeaways": [
            "Always inspect the actual sender email address domain, not just the display name.",
            "Beware of artificial urgency (e.g., 'Account locked in 24 hours').",
            "Hover over links to verify destination domains before clicking."
        ],
        "attack_anatomy": {
            "step1": "Attacker registers a visually similar domain (e.g. `paypa1-support.com`).",
            "step2": "Sends an email alerting victim to an urgent fraudulent invoice.",
            "step3": "Victim clicks link and lands on clone login portal.",
            "step4": "Entered credentials are harvested in real-time by the adversary."
        },
        "defense_checklist": [
            "Enable Multi-Factor Authentication (MFA).",
            "Verify suspicious internal requests by calling colleagues directly.",
            "Submit suspicious emails to CyberShield AI for deep analysis."
        ]
    },
    {
        "id": "upi-scam-protection",
        "title": "UPI & Digital Payment Fraud Prevention",
        "category": "Financial Safety",
        "level": "Essential",
        "estimated_time": "6 min",
        "badge": "Financial Shield",
        "summary": "Master the Golden Rule of UPI: Entering your UPI PIN or scanning a QR code is ONLY required to SEND money, never to RECEIVE money.",
        "key_takeaways": [
            "Entering a UPI PIN transfers money OUT of your bank account immediately.",
            "Refunds and cashback are credited automatically without scanning QR codes.",
            "Never download screen-sharing apps (AnyDesk, TeamViewer) at a caller's request."
        ],
        "attack_anatomy": {
            "step1": "Scammer poses as a buyer on OLX/Marketplace or a customer care agent.",
            "step2": "Sends a QR code or payment collect request claiming it will credit funds.",
            "step3": "Asks victim to open PhonePe / GPay and enter their 4/6-digit PIN.",
            "step4": "Money is instantaneously transferred to the scammer's mule account."
        },
        "defense_checklist": [
            "Refuse requests to scan QR codes for receiving payments.",
            "Keep daily UPI transaction limits set to reasonable amounts in banking apps.",
            "Report UPI fraud immediately to national helpline 1930."
        ]
    },
    {
        "id": "social-engineering",
        "title": "Social Engineering & Extortion Tactics",
        "category": "Human Vulnerabilities",
        "level": "Intermediate",
        "estimated_time": "7 min",
        "badge": "Psychological Firewall",
        "summary": "Understand how hackers exploit fear, curiosity, greed, and authority to manipulate human psychology into bypassing technical safeguards.",
        "key_takeaways": [
            "Fear & Urgency: Electricity disconnection or arrest threats.",
            "Authority: Impersonating police, customs officials, or senior executives.",
            "Greed: Fake high-paying work-from-home Telegram tasks."
        ],
        "attack_anatomy": {
            "step1": "Victim receives a terrifying call/message from 'Customs/Police'.",
            "step2": "Scammer claims a parcel in victim's name contains contraband.",
            "step3": "Directs victim to stay on a private video call (digital arrest tactic).",
            "step4": "Pressures victim to transfer funds to a 'verification account'."
        },
        "defense_checklist": [
            "Law enforcement agencies NEVER conduct arrests or fund transfers over Skype/WhatsApp.",
            "Take a deep breath and consult family/security advisors before taking action.",
            "Report harassment numbers directly to cybercrime authorities."
        ]
    },
    {
        "id": "fake-website-typosquatting",
        "title": "Malicious URLs & Fake Websites",
        "category": "Web Security",
        "level": "Beginner",
        "estimated_time": "4 min",
        "badge": "Web Sentry",
        "summary": "Spot deceptive domains, homograph attacks, lookalike characters, and illegitimate TLDs used to harvest logins.",
        "key_takeaways": [
            "Look for character substitutions: `0` for `o`, `rn` for `m`, `1` for `l`.",
            "Check for suspicious TLDs (`.xyz`, `.top`, `.tk`).",
            "HTTPS padlock only means encryption, not legitimacy."
        ],
        "attack_anatomy": {
            "step1": "Attacker buys lookalike domain `netfIix-verify.xyz`.",
            "step2": "Installs free SSL certificate to show the green padlock icon.",
            "step3": "Copies the exact styling and logos of the real brand.",
            "step4": "Captures credit card credentials submitted by deceived visitors."
        },
        "defense_checklist": [
            "Bookmark legitimate banking and shopping portals.",
            "Use password managers (they refuse to auto-fill on lookalike fake domains).",
            "Run unfamiliar URLs through CyberShield URL Scanner before visiting."
        ]
    }
]

QUIZ_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": "q1",
        "question": "A buyer on an online marketplace sends you a QR code claiming: 'Scan this QR code and enter your UPI PIN to receive ₹15,000 for your item'. What will happen if you proceed?",
        "options": [
            "₹15,000 will be credited directly to your bank account.",
            "₹15,000 will be deducted from your bank account immediately.",
            "Your bank account will be temporarily frozen for verification.",
            "You will receive an SMS confirmation before any money moves."
        ],
        "correct_index": 1,
        "explanation": "Entering your UPI PIN authorizes a DEBIT from your account. You NEVER need to scan a QR code or enter a PIN to receive money."
    },
    {
        "id": "q2",
        "question": "You receive an urgent email from 'support@paypa1-security.xyz' stating your account is suspended unless you verify your password within 2 hours. What is the safest response?",
        "options": [
            "Click the link immediately to prevent suspension.",
            "Reply to the email asking for confirmation.",
            "Delete the email, avoid clicking the link, and check your account via the official PayPal app.",
            "Forward the email to your friends to warn them."
        ],
        "correct_index": 2,
        "explanation": "The domain 'paypa1-security.xyz' uses typosquatting ('1' instead of 'l') and an abusive TLD (.xyz). Always access accounts directly via official apps or bookmarked URLs."
    },
    {
        "id": "q3",
        "question": "An SMS states: 'Your electricity connection will be disconnected tonight at 9:30 PM due to pending bill. Call electricity officer at 9876543210.' How do you verify this?",
        "options": [
            "Call the mobile number in the SMS right away.",
            "Download the remote support app they recommend to pay.",
            "Check your official electricity provider portal / mobile bill receipt independently.",
            "Send your credit card details via SMS."
        ],
        "correct_index": 2,
        "explanation": "Utility companies do not send personal mobile numbers for bill payments or disconnect power within hours via SMS. Always verify on the official utility portal."
    }
]

def get_learning_content() -> Dict[str, Any]:
    return {
        "modules": LEARNING_MODULES,
        "quiz": QUIZ_QUESTIONS
    }
