import sqlite3
import json
import uuid
from datetime import datetime

class MysticalDB:
    def __init__(self, db_name="mystical_guidance.db"):
        self.conn = sqlite3.connect(db_name, check_same_thread=False)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'seeker',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            divination_type TEXT,
            session_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
        ''')
        self.conn.commit()

    def create_user(self, username, password_hash, role="seeker"):
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                (username, password_hash, role)
            )
            self.conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None

    def get_user_by_username(self, username):
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, username, password_hash, role FROM users WHERE username = ?", (username,))
        return cursor.fetchone()

    def get_or_create_user(self, username):
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user: return user[0]
        cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (?, 'none', 'guest')", (username,))
        self.conn.commit()
        return cursor.lastrowid

    def start_session(self, user_id, divination_type, session_data):
        session_id = str(uuid.uuid4())
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO sessions (id, user_id, divination_type, session_data) VALUES (?, ?, ?, ?)",
            (session_id, user_id, divination_type, json.dumps(session_data))
        )
        self.conn.commit()
        return session_id

    def save_message(self, session_id, role, content):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO chat_history (session_id, role, content) VALUES (?, ?, ?)",
            (session_id, role, content)
        )
        self.conn.commit()

    def get_session_history(self, session_id):
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT role, content FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC",
            (session_id,)
        )
        rows = cursor.fetchall()
        return [{"role": row[0], "content": row[1]} for row in rows]
