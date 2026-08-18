import hashlib
import secrets
from database import get_db_connection

# Simple, reliable salt+hash using hashlib (no compiled C-dependency needed)
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${pw_hash}"

def verify_password(stored_hash: str, provided_password: str) -> bool:
    try:
        salt, expected_hash = stored_hash.split('$')
        calculated_hash = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return secrets.compare_digest(expected_hash, calculated_hash)
    except Exception:
        return False

def register_user(email: str, full_name: str, password: str, zodiac_sign: str = "Aries"):
    email = email.strip().lower()
    full_name = full_name.strip()
    if not email or not password or not full_name:
        return {"success": False, "message": "All fields are required."}
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return {"success": False, "message": "An account with this email already exists."}
    
    pw_hash = hash_password(password)
    cursor.execute(
        "INSERT INTO users (email, full_name, password_hash, zodiac_sign) VALUES (?, ?, ?, ?)",
        (email, full_name, pw_hash, zodiac_sign)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Generate token
    token = secrets.token_urlsafe(32)
    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "zodiac_sign": zodiac_sign,
            "token": f"token_{user_id}_{token}"
        }
    }

def login_user(email: str, password: str):
    email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return {"success": False, "message": "Invalid email or password."}
    
    if not verify_password(user["password_hash"], password):
        return {"success": False, "message": "Invalid email or password."}
    
    token = secrets.token_urlsafe(32)
    return {
        "success": True,
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "zodiac_sign": user["zodiac_sign"],
            "token": f"token_{user['id']}_{token}"
        }
    }

