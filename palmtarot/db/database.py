import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

import pymongo
from pymongo import MongoClient

from ..config import settings
from .models import (
    ChatMessageRecord,
    PalmAnalysisRecord,
    TarotReadingRecord,
    UserModel,
    UserSession,
)

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Persistent storage manager with MongoDB driver and local file backup."""

    def __init__(self, uri: str | None = None, db_name: str | None = None):
        self.uri = uri or settings.MONGODB_URI
        self.db_name = db_name or settings.DATABASE_NAME
        self.client: MongoClient | None = None
        self.db = None
        self.local_storage_file = settings.OUTPUT_DIR / "persistent_db_backup.json"
        self._init_connection()

    def _init_connection(self):
        """Attempt MongoDB connection; enable fallback if server unreachable."""
        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=1500)
            # Test connection with ping
            self.client.admin.command("ping")
            self.db = self.client[self.db_name]
            logger.info(f"Connected successfully to MongoDB database: '{self.db_name}'.")
        except Exception as e:
            logger.warning(f"MongoDB connection unavailable at '{self.uri}': {e}. Using persistent disk storage fallback.")
            self.client = None
            self.db = None
            self._init_local_backup_file()

    def _init_local_backup_file(self):
        """Ensure local fallback JSON storage structure exists."""
        if not self.local_storage_file.exists():
            initial_data = {
                "users": {},
                "plans": {},
                "sessions": {},
                "palm_analyses": [],
                "tarot_readings": [],
                "chat_messages": []
            }
            with open(self.local_storage_file, "w", encoding="utf-8") as f:
                json.dump(initial_data, f, indent=2)

    def _read_local_data(self) -> dict[str, Any]:
        self._init_local_backup_file()
        try:
            with open(self.local_storage_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "users" not in data:
                    data["users"] = {}
                if "plans" not in data:
                    data["plans"] = {}
                return data
        except Exception:
            return {
                "users": {},
                "plans": {},
                "sessions": {},
                "palm_analyses": [],
                "tarot_readings": [],
                "chat_messages": []
            }

    def _write_local_data(self, data: dict[str, Any]):
        with open(self.local_storage_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    # --- User Management ---
    def save_user(self, user: UserModel) -> UserModel:
        if self.db is not None:
            try:
                col = self.db["users"]
                col.replace_one({"id": user.id}, user.model_dump(), upsert=True)
                return user
            except Exception as e:
                logger.error(f"Failed to save user to MongoDB: {e}")

        data = self._read_local_data()
        data["users"][user.id] = user.model_dump()
        self._write_local_data(data)
        return user

    def get_user_by_email(self, email: str) -> UserModel | None:
        email_clean = email.lower().strip()
        if self.db is not None:
            try:
                col = self.db["users"]
                doc = col.find_one({"email": email_clean})
                if doc:
                    return UserModel(**doc)
            except Exception as e:
                logger.error(f"Failed to fetch user by email from MongoDB: {e}")

        data = self._read_local_data()
        for u in data.get("users", {}).values():
            if u.get("email", "").lower().strip() == email_clean:
                return UserModel(**u)
        return None

    def get_user_by_username(self, username: str) -> UserModel | None:
        uname_clean = username.lower().strip()
        if self.db is not None:
            try:
                col = self.db["users"]
                doc = col.find_one({"username": uname_clean})
                if doc:
                    return UserModel(**doc)
            except Exception as e:
                logger.error(f"Failed to fetch user by username from MongoDB: {e}")

        data = self._read_local_data()
        for u in data.get("users", {}).values():
            if u.get("username", "").lower().strip() == uname_clean:
                return UserModel(**u)
        return None

    def get_user_by_id(self, user_id: str) -> UserModel | None:
        if self.db is not None:
            try:
                col = self.db["users"]
                doc = col.find_one({"id": user_id})
                if doc:
                    return UserModel(**doc)
            except Exception as e:
                logger.error(f"Failed to fetch user by ID from MongoDB: {e}")

        data = self._read_local_data()
        if user_id in data.get("users", {}):
            return UserModel(**data["users"][user_id])
        return None

    def get_all_users(self) -> list[UserModel]:
        if self.db is not None:
            try:
                col = self.db["users"]
                docs = list(col.find({}))
                return [UserModel(**d) for d in docs]
            except Exception as e:
                logger.error(f"Failed to fetch all users from MongoDB: {e}")

        data = self._read_local_data()
        return [UserModel(**u) for u in data.get("users", {}).values()]

    def update_user(self, user_id: str, updates: dict[str, Any]) -> UserModel | None:
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        updated_dict = user.model_dump()
        updated_dict.update(updates)
        updated_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated_user = UserModel(**updated_dict)
        return self.save_user(updated_user)


    # --- Session Management ---
    def get_session_by_id(self, session_id: str) -> UserSession | None:
        if self.db is not None:
            try:
                col = self.db["sessions"]
                doc = col.find_one({"session_id": session_id})
                if doc:
                    return UserSession(**doc)
            except Exception as e:
                logger.error(f"Failed to fetch session from MongoDB: {e}")

        data = self._read_local_data()
        if session_id in data.get("sessions", {}):
            return UserSession(**data["sessions"][session_id])
        return None

    def get_user_session_ids(self, user_id: str) -> set:
        sids = set()
        if self.db is not None:
            try:
                col = self.db["sessions"]
                docs = col.find({"user_id": user_id})
                for d in docs:
                    sids.add(d["session_id"])
            except Exception as e:
                logger.error(f"Failed to fetch user sessions from MongoDB: {e}")

        data = self._read_local_data()
        for s in data.get("sessions", {}).values():
            if s.get("user_id") == user_id:
                sids.add(s["session_id"])
        return sids

    def _resolve_record_user_id(self, record):
        if not getattr(record, "user_id", None) and getattr(record, "session_id", None):
            sess = self.get_session_by_id(record.session_id)
            if sess and sess.user_id:
                record.user_id = sess.user_id
        return record

    def create_or_get_session(self, session_id: str | None = None, username: str = "guest", user_id: str | None = None) -> UserSession:
        sid = session_id or str(uuid.uuid4())
        session = UserSession(session_id=sid, username=username, user_id=user_id)

        if self.db is not None:
            try:
                col = self.db["sessions"]
                existing = col.find_one({"session_id": sid})
                if existing:
                    if user_id and not existing.get("user_id"):
                        col.update_one({"session_id": sid}, {"$set": {"user_id": user_id, "username": username}})
                        existing["user_id"] = user_id
                        existing["username"] = username
                    return UserSession(**existing)
                col.insert_one(session.model_dump())
                return session
            except Exception as e:
                logger.error(f"Failed to write session to MongoDB: {e}")

        data = self._read_local_data()
        if sid in data["sessions"]:
            if user_id and not data["sessions"][sid].get("user_id"):
                data["sessions"][sid]["user_id"] = user_id
                data["sessions"][sid]["username"] = username
                self._write_local_data(data)
            return UserSession(**data["sessions"][sid])
        data["sessions"][sid] = session.model_dump()
        self._write_local_data(data)
        return session

    # --- Palm Analysis Records ---
    def save_palm_analysis(self, record: PalmAnalysisRecord) -> PalmAnalysisRecord:
        record = self._resolve_record_user_id(record)
        if self.db is not None:
            try:
                col = self.db["palm_analyses"]
                col.insert_one(record.model_dump())
                return record
            except Exception as e:
                logger.error(f"Failed to save palm analysis to MongoDB: {e}")

        data = self._read_local_data()
        data["palm_analyses"].append(record.model_dump())
        self._write_local_data(data)
        return record

    def get_latest_palm_analysis(self, session_id: str) -> PalmAnalysisRecord | None:
        if self.db is not None:
            try:
                col = self.db["palm_analyses"]
                res = col.find({"session_id": session_id}).sort("timestamp", pymongo.DESCENDING).limit(1)
                docs = list(res)
                if docs:
                    return PalmAnalysisRecord(**docs[0])
            except Exception as e:
                logger.error(f"Failed to fetch palm analysis from MongoDB: {e}")

        data = self._read_local_data()
        matches = [p for p in data["palm_analyses"] if p.get("session_id") == session_id]
        if matches:
            matches.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return PalmAnalysisRecord(**matches[0])
        return None

    def get_user_palm_analyses(self, user_id: str) -> list[PalmAnalysisRecord]:
        sids = self.get_user_session_ids(user_id)
        if self.db is not None:
            try:
                col = self.db["palm_analyses"]
                res = col.find({"$or": [{"user_id": user_id}, {"session_id": {"$in": list(sids)}}]}).sort("timestamp", pymongo.DESCENDING)
                seen_ids = set()
                records = []
                for doc in res:
                    rec = PalmAnalysisRecord(**doc)
                    if rec.id not in seen_ids:
                        seen_ids.add(rec.id)
                        records.append(rec)
                return records
            except Exception as e:
                logger.error(f"Failed to fetch user palm analyses from MongoDB: {e}")

        data = self._read_local_data()
        seen_ids = set()
        matches = []
        for p in data.get("palm_analyses", []):
            if p.get("user_id") == user_id or p.get("session_id") in sids:
                pid = p.get("id")
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    matches.append(p)
        matches.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return [PalmAnalysisRecord(**p) for p in matches]

    # --- Tarot Reading Records ---
    def save_tarot_reading(self, record: TarotReadingRecord) -> TarotReadingRecord:
        record = self._resolve_record_user_id(record)
        if self.db is not None:
            try:
                col = self.db["tarot_readings"]
                col.insert_one(record.model_dump())
                return record
            except Exception as e:
                logger.error(f"Failed to save tarot reading to MongoDB: {e}")

        data = self._read_local_data()
        data["tarot_readings"].append(record.model_dump())
        self._write_local_data(data)
        return record

    def get_latest_tarot_reading(self, session_id: str) -> TarotReadingRecord | None:
        if self.db is not None:
            try:
                col = self.db["tarot_readings"]
                res = col.find({"session_id": session_id}).sort("timestamp", pymongo.DESCENDING).limit(1)
                docs = list(res)
                if docs:
                    return TarotReadingRecord(**docs[0])
            except Exception as e:
                logger.error(f"Failed to fetch tarot reading from MongoDB: {e}")

        data = self._read_local_data()
        matches = [t for t in data["tarot_readings"] if t.get("session_id") == session_id]
        if matches:
            matches.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return TarotReadingRecord(**matches[0])
        return None

    def get_user_tarot_readings(self, user_id: str) -> list[TarotReadingRecord]:
        sids = self.get_user_session_ids(user_id)
        if self.db is not None:
            try:
                col = self.db["tarot_readings"]
                res = col.find({"$or": [{"user_id": user_id}, {"session_id": {"$in": list(sids)}}]}).sort("timestamp", pymongo.DESCENDING)
                seen_ids = set()
                records = []
                for doc in res:
                    rec = TarotReadingRecord(**doc)
                    if rec.id not in seen_ids:
                        seen_ids.add(rec.id)
                        records.append(rec)
                return records
            except Exception as e:
                logger.error(f"Failed to fetch user tarot readings from MongoDB: {e}")

        data = self._read_local_data()
        seen_ids = set()
        matches = []
        for t in data.get("tarot_readings", []):
            if t.get("user_id") == user_id or t.get("session_id") in sids:
                tid = t.get("id")
                if tid not in seen_ids:
                    seen_ids.add(tid)
                    matches.append(t)
        matches.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return [TarotReadingRecord(**t) for t in matches]

    # --- Chat History Records ---
    def save_chat_message(self, record: ChatMessageRecord) -> ChatMessageRecord:
        record = self._resolve_record_user_id(record)
        if self.db is not None:
            try:
                col = self.db["chat_messages"]
                col.insert_one(record.model_dump())
                return record
            except Exception as e:
                logger.error(f"Failed to save chat message to MongoDB: {e}")

        data = self._read_local_data()
        data["chat_messages"].append(record.model_dump())
        self._write_local_data(data)
        return record

    def get_chat_history(self, session_id: str, limit: int = 50) -> list[ChatMessageRecord]:
        if self.db is not None:
            try:
                col = self.db["chat_messages"]
                res = col.find({"session_id": session_id}).sort("timestamp", pymongo.ASCENDING).limit(limit)
                return [ChatMessageRecord(**doc) for doc in res]
            except Exception as e:
                logger.error(f"Failed to fetch chat history from MongoDB: {e}")

        data = self._read_local_data()
        matches = [m for m in data.get("chat_messages", []) if m.get("session_id") == session_id]
        matches.sort(key=lambda x: x.get("timestamp", ""))
        return [ChatMessageRecord(**m) for m in matches[-limit:]]

    def get_user_chat_messages(self, user_id: str) -> list[ChatMessageRecord]:
        sids = self.get_user_session_ids(user_id)
        if self.db is not None:
            try:
                col = self.db["chat_messages"]
                res = col.find({"$or": [{"user_id": user_id}, {"session_id": {"$in": list(sids)}}]}).sort("timestamp", pymongo.DESCENDING)
                seen_ids = set()
                records = []
                for doc in res:
                    rec = ChatMessageRecord(**doc)
                    if rec.id not in seen_ids:
                        seen_ids.add(rec.id)
                        records.append(rec)
                return records
            except Exception as e:
                logger.error(f"Failed to fetch user chat messages from MongoDB: {e}")

        data = self._read_local_data()
        seen_ids = set()
        matches = []
        for m in data.get("chat_messages", []):
            if m.get("user_id") == user_id or m.get("session_id") in sids:
                mid = m.get("id")
                if mid not in seen_ids:
                    seen_ids.add(mid)
                    matches.append(m)
        matches.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return [ChatMessageRecord(**m) for m in matches]


# Global singleton instance
db_manager = DatabaseManager()

