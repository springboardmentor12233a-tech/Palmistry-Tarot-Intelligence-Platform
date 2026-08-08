from auth import hash_password, verify_password, create_access_token, decode_access_token

# Test password hashing
password = "mysecretpassword"
hashed = hash_password(password)
print("Hashed:", hashed)
print("Correct password verifies:", verify_password(password, hashed))
print("Wrong password verifies:", verify_password("wrongpassword", hashed))

# Test JWT
token = create_access_token({"sub": "test@example.com"})
print("\nToken:", token)
decoded = decode_access_token(token)
print("Decoded payload:", decoded)