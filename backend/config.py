import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/cybershield_ai")
JWT_SECRET = os.getenv("JWT_SECRET", "cybershield_ai_jwt_secret_key_hackathon_2026_super_secure")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_DAYS = 7

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "Datasets", "model")
FALLBACK_MODELS_DIR = os.path.join(BASE_DIR, "models")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
