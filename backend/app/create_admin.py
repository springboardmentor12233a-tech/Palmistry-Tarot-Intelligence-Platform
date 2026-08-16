import asyncio
from datetime import datetime, timezone

from app.database import users_collection
from app.auth import hash_password


async def create_admin():
    email = "admin@palmistry.com"
    password = "Admin@123"
    name = "Administrator"

    existing_admin = await users_collection.find_one({"email": email})

    if existing_admin:
        print("Admin already exists.")
        return

    admin_doc = {
        "name": name,
        "email": email,
        "hashed_password": hash_password(password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc)
    }

    await users_collection.insert_one(admin_doc)

    print("Admin created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")


if __name__ == "__main__":
    asyncio.run(create_admin())