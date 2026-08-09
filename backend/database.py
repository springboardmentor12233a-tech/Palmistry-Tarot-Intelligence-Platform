import sqlite3
import json
import uuid

class MysticalDB:
    def __init__(self, db_path="mystical_guidance.db"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row 
        self._create_schema()

    def _create_schema(self):
        """Initializes the relational tables if they don't exist."""
        with self.conn:
            # Users Table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Sessions Table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    user_id INTEGER,
                    reading_type TEXT NOT NULL,
                    vision_metrics JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')
            
            # Chat History Table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS chat_history (
                    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions (session_id)
                )
            ''')

    def get_or_create_user(self, username):
        """Retrieves an existing user or creates a new one."""
        with self.conn:
            cursor = self.conn.execute("SELECT user_id FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
            if row:
                return row['user_id']
            cursor = self.conn.execute("INSERT INTO users (username) VALUES (?)", (username,))
            return cursor.lastrowid

    def start_session(self, user_id, reading_type, vision_metrics):
        """Creates a new reading session."""
        session_id = str(uuid.uuid4())
        metrics_json = json.dumps(vision_metrics)
        with self.conn:
            self.conn.execute('''
                INSERT INTO sessions (session_id, user_id, reading_type, vision_metrics)
                VALUES (?, ?, ?, ?)
            ''', (session_id, user_id, reading_type, metrics_json))
        return session_id

    def save_message(self, session_id, role, content):
        """Appends a single chat turn to the database."""
        with self.conn:
            self.conn.execute('''
                INSERT INTO chat_history (session_id, role, content)
                VALUES (?, ?, ?)
            ''', (session_id, role, content))

    def get_session_history(self, session_id):
        """Retrieves the full chat history formatted perfectly for the Groq API."""
        cursor = self.conn.execute('''
            SELECT role, content FROM chat_history 
            WHERE session_id = ? 
            ORDER BY timestamp ASC
        ''', (session_id,))
        
        return [{"role": row["role"], "content": row["content"]} for row in cursor.fetchall()]
