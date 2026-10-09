import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import pymongo
from pymongo import MongoClient
from backend.config import MONGODB_URI

# Fallback JSON store path
DB_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DB_DIR, exist_ok=True)
USERS_FILE = os.path.join(DB_DIR, "users.json")
SCANS_FILE = os.path.join(DB_DIR, "scans.json")
FEEDBACK_FILE = os.path.join(DB_DIR, "feedback.json")

class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.client = None
        self.db = None
        self._init_mongo()

    def _init_mongo(self):
        try:
            self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
            self.client.server_info()
            try:
                self.db = self.client.get_default_database()
            except Exception:
                self.db = self.client["cybershield_ai"]
            if self.db is None:
                self.db = self.client["cybershield_ai"]
            self.use_mongo = True
            print("[DB] Connected to MongoDB successfully!")
        except Exception as e:
            print(f"[DB] MongoDB not reachable ({e}). Using persistent local JSON database.")
            self.use_mongo = False

    def _read_json(self, file_path: str) -> List[Dict[str, Any]]:
        if not os.path.exists(file_path):
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_json(self, file_path: str, data: List[Dict[str, Any]]):
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, default=str, indent=2)

    # --- User operations ---
    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.use_mongo:
            try:
                user = self.db.users.find_one({"email": email})
                if user:
                    user["id"] = str(user.get("_id", user.get("id", "")))
                    return user
            except Exception:
                pass
        users = self._read_json(USERS_FILE)
        for u in users:
            if u.get("email", "").lower().strip() == email:
                return u
        return None

    def find_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            try:
                user = self.db.users.find_one({"id": user_id})
                if user:
                    user["id"] = str(user.get("_id", user.get("id", "")))
                    return user
            except Exception:
                pass
        users = self._read_json(USERS_FILE)
        for u in users:
            if u.get("id") == user_id:
                return u
        return None

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        user_data["id"] = user_id
        user_data["email"] = user_data["email"].lower().strip()
        user_data["created_at"] = datetime.utcnow().isoformat()
        user_data.setdefault("role", "SOC Analyst")
        user_data.setdefault("safety_score", 92)

        if self.use_mongo:
            try:
                self.db.users.insert_one(dict(user_data))
            except Exception as e:
                print(f"[DB] Mongo insert error: {e}")

        users = self._read_json(USERS_FILE)
        users.append(user_data)
        self._write_json(USERS_FILE, users)
        return user_data

    # --- Scan History operations ---
    def save_scan(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        scan_id = str(uuid.uuid4())
        scan_data["id"] = scan_id
        scan_data["timestamp"] = datetime.utcnow().isoformat()

        if self.use_mongo:
            try:
                self.db.scans.insert_one(dict(scan_data))
            except Exception as e:
                print(f"[DB] Mongo insert error: {e}")

        scans = self._read_json(SCANS_FILE)
        scans.insert(0, scan_data)
        self._write_json(SCANS_FILE, scans)
        return scan_data

    def get_scans(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if self.use_mongo:
            try:
                query = {"user_id": user_id} if user_id else {}
                scans = list(self.db.scans.find(query).sort("timestamp", pymongo.DESCENDING).limit(limit))
                for s in scans:
                    s["id"] = str(s.get("_id", s.get("id", "")))
                    s.pop("_id", None)
                if scans:
                    return scans
            except Exception:
                pass
        scans = self._read_json(SCANS_FILE)
        if user_id:
            scans = [s for s in scans if s.get("user_id") == user_id]
        return scans[:limit]

    def delete_scan(self, scan_id: str) -> bool:
        if self.use_mongo:
            try:
                self.db.scans.delete_one({"id": scan_id})
            except Exception:
                pass
        scans = self._read_json(SCANS_FILE)
        new_scans = [s for s in scans if s.get("id") != scan_id]
        self._write_json(SCANS_FILE, new_scans)
        return len(new_scans) < len(scans)

db = DatabaseManager()
