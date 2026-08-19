import sqlite3
from pathlib import Path
import hashlib


# ======================================
# DATABASE PATH
# ======================================

DB_PATH = Path(__file__).resolve().parent / "readings.db"


# ======================================
# DATABASE CONNECTION
# ======================================

def get_connection():
    return sqlite3.connect(DB_PATH)


# ======================================
# PASSWORD HASHING
# ======================================

def hash_password(password):
    return hashlib.sha256(
        password.encode()
    ).hexdigest()


# ======================================
# INITIALIZE DATABASE
# ======================================

def initialize_database():

    connection = get_connection()
    cursor = connection.cursor()

    # -----------------------------
    # USERS TABLE
    # -----------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -----------------------------
    # READINGS TABLE
    # -----------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            reading_type TEXT NOT NULL,
            question TEXT,
            cards TEXT,
            ai_reading TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    connection.commit()
    connection.close()


# ======================================
# CREATE USER
# ======================================

def create_user(
    name,
    email,
    password,
    role="user"
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
            """,
            (
                name,
                email,
                hash_password(password),
                role
            )
        )

        connection.commit()

        return True

    except sqlite3.IntegrityError:

        return False

    finally:

        connection.close()


# ======================================
# AUTHENTICATE USER
# ======================================

def authenticate_user(
    email,
    password
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, email, role
        FROM users
        WHERE email = ?
        AND password_hash = ?
        """,
        (
            email,
            hash_password(password)
        )
    )

    user = cursor.fetchone()

    connection.close()

    return user


# ======================================
# RESET PASSWORD
# ======================================

def reset_password(
    email,
    name,
    new_password
):

    connection = get_connection()
    cursor = connection.cursor()

    # Find matching user
    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        AND name = ?
        """,
        (
            email,
            name
        )
    )

    user = cursor.fetchone()

    # No matching account
    if user is None:

        connection.close()

        return False

    # Update password
    cursor.execute(
        """
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        """,
        (
            hash_password(new_password),
            user[0]
        )
    )

    connection.commit()
    connection.close()

    return True


# ======================================
# SAVE READING
# ======================================

def save_reading(
    reading_type,
    question,
    cards,
    ai_reading,
    user_id=None
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO readings
        (
            user_id,
            reading_type,
            question,
            cards,
            ai_reading
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            user_id,
            reading_type,
            question,
            cards,
            ai_reading
        )
    )

    connection.commit()
    connection.close()


# ======================================
# USER READING HISTORY
# ======================================

def get_user_reading_history(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            reading_type,
            question,
            cards,
            ai_reading,
            created_at
        FROM readings
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user_id,)
    )

    readings = cursor.fetchall()

    connection.close()

    return readings


# ======================================
# ADMIN DASHBOARD STATISTICS
# ======================================

def get_dashboard_stats():

    connection = get_connection()
    cursor = connection.cursor()

    # Total users
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM users
        WHERE role = 'user'
        """
    )

    total_users = cursor.fetchone()[0]

    # Total readings
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM readings
        """
    )

    total_readings = cursor.fetchone()[0]

    # Palmistry
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM readings
        WHERE reading_type = 'Palmistry'
        """
    )

    palmistry_readings = cursor.fetchone()[0]

    # Tarot
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM readings
        WHERE reading_type = 'Tarot'
        """
    )

    tarot_readings = cursor.fetchone()[0]

    # Combined
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM readings
        WHERE reading_type = 'Combined'
        """
    )

    combined_readings = cursor.fetchone()[0]

    connection.close()

    return {
        "users": total_users,
        "readings": total_readings,
        "palmistry": palmistry_readings,
        "tarot": tarot_readings,
        "combined": combined_readings
    }


# ======================================
# USER STATISTICS
# ======================================

def get_user_statistics():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            u.id,
            u.name,
            u.email,
            u.created_at,
            COUNT(r.id) AS reading_count

        FROM users u

        LEFT JOIN readings r
            ON u.id = r.user_id

        WHERE u.role = 'user'

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.created_at

        ORDER BY u.id DESC
        """
    )

    users = cursor.fetchall()

    connection.close()

    return users
# ======================================
# CHANGE PASSWORD
# ======================================

def change_password(
    user_id,
    current_password,
    new_password
):

    connection = get_connection()
    cursor = connection.cursor()

    # Check current password
    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE id = ?
        AND password_hash = ?
        """,
        (
            user_id,
            hash_password(current_password)
        )
    )

    user = cursor.fetchone()

    # Current password is incorrect
    if user is None:

        connection.close()

        return False

    # Update password
    cursor.execute(
        """
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        """,
        (
            hash_password(new_password),
            user_id
        )
    )

    connection.commit()
    connection.close()

    return True
# ======================================
# UPDATE AI READING
# ======================================

def update_reading_ai(
    reading_id,
    ai_reading
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE readings
        SET ai_reading = ?
        WHERE id = ?
        """,
        (
            ai_reading,
            reading_id
        )
    )

    connection.commit()

    updated = cursor.rowcount > 0

    connection.close()

    return updated