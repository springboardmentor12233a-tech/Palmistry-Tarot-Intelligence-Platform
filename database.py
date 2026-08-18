import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import secrets


# ------------------------------------------------------------
# DATABASE LOCATION
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "users.db"

DATA_DIR.mkdir(exist_ok=True)


# ------------------------------------------------------------
# DATABASE CONNECTION
# ------------------------------------------------------------

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ------------------------------------------------------------
# CREATE TABLES
# ------------------------------------------------------------

def initialize_database():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    conn.commit()
    conn.close()


# ------------------------------------------------------------
# PASSWORD HASHING
# ------------------------------------------------------------

def hash_password(password):

    # PBKDF2 is deliberately slow and uses a unique random salt
    # for every password.
    iterations = 600_000
    salt = secrets.token_bytes(16)

    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )

    return (
        f"pbkdf2_sha256${iterations}$"
        f"{salt.hex()}${derived_key.hex()}"
    )


# ------------------------------------------------------------
# CREATE USER
# ------------------------------------------------------------

def create_user(name, email, password):

    name = name.strip()
    email = email.strip().lower()

    if not name or not email or not password:
        return False, "All fields are required."

    password_hash = hash_password(password)

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password_hash, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                name,
                email,
                password_hash,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )

        conn.commit()

        return True, "Account created successfully."

    except sqlite3.IntegrityError:

        return False, "An account with this email already exists."

    finally:

        conn.close()


# ------------------------------------------------------------
# LOGIN USER
# ------------------------------------------------------------

def authenticate_user(email, password):

    email = email.strip().lower()

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, password_hash, created_at
        FROM users
        WHERE email = ?
        """,
        (email,),
    )

    user = cursor.fetchone()

    if user is None:
        conn.close()
        return None

    stored_hash = user["password_hash"]

    # --------------------------------------------------------
    # New PBKDF2 password
    # --------------------------------------------------------

    if stored_hash.startswith("pbkdf2_sha256$"):

        try:
            _, iterations, salt_hex, stored_key = stored_hash.split("$")

            iterations = int(iterations)

            salt = bytes.fromhex(salt_hex)

            derived_key = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                salt,
                iterations,
            ).hex()

            if not secrets.compare_digest(
                derived_key,
                stored_key,
            ):
                conn.close()
                return None

        except (ValueError, TypeError):

            conn.close()
            return None

    # --------------------------------------------------------
    # Existing SHA-256 password
    # --------------------------------------------------------
    # Existing users can still log in.
    # After successful login, their password is upgraded
    # automatically to PBKDF2.

    else:

        legacy_hash = hashlib.sha256(
            password.encode("utf-8")
        ).hexdigest()

        if not secrets.compare_digest(
            legacy_hash,
            stored_hash,
        ):
            conn.close()
            return None

        upgraded_hash = hash_password(password)

        cursor.execute(
            """
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
            """,
            (
                upgraded_hash,
                user["id"],
            ),
        )

        conn.commit()

    result = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "created_at": user["created_at"],
    }

    conn.close()

    return result

# ------------------------------------------------------------
# GET USER BY EMAIL
# ------------------------------------------------------------

def get_user_by_email(email):

    email = email.strip().lower()

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, created_at
        FROM users
        WHERE email = ?
        """,
        (email,),
    )

    user = cursor.fetchone()

    conn.close()

    if user is None:
        return None

    return dict(user)


# ------------------------------------------------------------
# GET ALL USERS
# ------------------------------------------------------------

def get_all_users():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, created_at
        FROM users
        ORDER BY created_at DESC
        """
    )

    users = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return users


# ------------------------------------------------------------
# INITIALIZE DATABASE
# ------------------------------------------------------------

initialize_database()



# ------------------------------------------------------------
# UPDATE USERNAME
# ------------------------------------------------------------

def update_username(user_id, new_name):

    new_name = str(new_name).strip()

    if not new_name:
        return False, "Username cannot be empty."

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE users
            SET name = ?
            WHERE id = ?
            """,
            (
                new_name,
                user_id,
            ),
        )

        conn.commit()

        if cursor.rowcount == 0:
            return False, "User account was not found."

        return True, "Username updated successfully."

    finally:

        conn.close()


# ------------------------------------------------------------
# UPDATE EMAIL
# ------------------------------------------------------------

def update_email(user_id, new_email):

    new_email = str(new_email).strip().lower()

    if not new_email:
        return False, "Email cannot be empty."

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE users
            SET email = ?
            WHERE id = ?
            """,
            (
                new_email,
                user_id,
            ),
        )

        conn.commit()

        if cursor.rowcount == 0:
            return False, "User account was not found."

        return True, "Email updated successfully."

    except sqlite3.IntegrityError:

        return False, "An account with this email already exists."

    finally:

        conn.close()


# ------------------------------------------------------------
# UPDATE PASSWORD
# ------------------------------------------------------------

def update_password(user_id, new_password):

    new_password = str(new_password)

    if not new_password:
        return False, "Password cannot be empty."

    if len(new_password) < 8:
        return False, "Password must contain at least 8 characters."

    password_hash = hash_password(new_password)

    conn = get_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
            """,
            (
                password_hash,
                user_id,
            ),
        )

        conn.commit()

        if cursor.rowcount == 0:
            return False, "User account was not found."

        return True, "Password updated successfully."

    finally:

        conn.close()


# ------------------------------------------------------------
# DELETE USER ACCOUNT
# ------------------------------------------------------------

def delete_user(user_id):

    conn = get_connection()

    try:

        cursor = conn.cursor()

        # Delete saved readings belonging to the account first.
        cursor.execute(
            """
            DELETE FROM readings
            WHERE user_id = ?
            """,
            (user_id,),
        )

        # Then delete the user.
        cursor.execute(
            """
            DELETE FROM users
            WHERE id = ?
            """,
            (user_id,),
        )

        if cursor.rowcount == 0:
            conn.rollback()
            return False, "User account was not found."

        conn.commit()

        return True, "Account deleted successfully."

    finally:

        conn.close()



# ------------------------------------------------------------
# CREATE READINGS TABLE
# ------------------------------------------------------------

def initialize_readings_table():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            spread_size INTEGER,
            result_json TEXT NOT NULL,
            created_at TEXT NOT NULL,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
        )
        """
    )

    conn.commit()
    conn.close()


# ------------------------------------------------------------
# SAVE READING
# ------------------------------------------------------------

def save_reading(
    user_id,
    question,
    spread_size,
    result,
):

    import json

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO readings
        (
            user_id,
            question,
            spread_size,
            result_json,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            user_id,
            question,
            int(spread_size),
            json.dumps(result, ensure_ascii=False),
            datetime.now().isoformat(timespec="seconds"),
        ),
    )

    conn.commit()

    reading_id = cursor.lastrowid

    conn.close()

    return reading_id


# ------------------------------------------------------------
# GET USER READINGS
# ------------------------------------------------------------

def get_user_readings(user_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            question,
            spread_size,
            result_json,
            created_at
        FROM readings
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user_id,),
    )

    readings = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return readings


# ------------------------------------------------------------
# GET ALL READINGS
# ------------------------------------------------------------

def get_all_readings():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            readings.id,
            readings.user_id,
            users.name,
            users.email,
            readings.question,
            readings.spread_size,
            readings.result_json,
            readings.created_at
        FROM readings
        LEFT JOIN users
        ON readings.user_id = users.id
        ORDER BY readings.created_at DESC
        """
    )

    readings = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return readings


# ------------------------------------------------------------
# INITIALIZE READINGS TABLE
# ------------------------------------------------------------

initialize_readings_table()