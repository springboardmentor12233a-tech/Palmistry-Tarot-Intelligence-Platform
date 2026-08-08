import asyncio
from database import client, db

async def test_connection():
    try:
        await client.admin.command("ping")
        print("MongoDB connected successfully")
        print("Database name:", db.name)
        collections = await db.list_collection_names()
        print("Existing collections:", collections)
    except Exception as e:
        print("Connection failed:", e)

asyncio.run(test_connection())