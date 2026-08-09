import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(ENV_PATH)

MONGODB_URL = os.environ["MONGODB_URL"]
MONGODB_DB_NAME = os.environ["MONGODB_DB_NAME"]

client = AsyncIOMotorClient(MONGODB_URL)
db = client[MONGODB_DB_NAME]

users_collection = db["users"]
readings_collection = db["readings"]

async def save_reading(user_email: str, reading_type: str, data: dict):
    document = {
        "user_email": user_email,
        "reading_type": reading_type,  # "palm", "tarot", or "combined"
        "data": data,
        "created_at": datetime.now(timezone.utc)
    }
    result = await readings_collection.insert_one(document)
    return str(result.inserted_id)

async def get_user_readings(user_email: str, limit: int = 20):
    cursor = readings_collection.find(
        {"user_email": user_email}
    ).sort("created_at", -1).limit(limit)

    readings = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # ObjectId isn't JSON-serializable by default
        readings.append(doc)

    return readings

async def get_reading_stats(user_email: str):
    pipeline = [
        {"$match": {"user_email": user_email}},
        {"$group": {"_id": "$reading_type", "count": {"$sum": 1}}}
    ]
    results = await readings_collection.aggregate(pipeline).to_list(length=None)

    stats = {"palm": 0, "tarot": 0, "combined": 0}
    for r in results:
        stats[r["_id"]] = r["count"]
    stats["total"] = sum(stats.values())
    return stats