from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from app.database import users_collection, readings_collection
from app.auth import get_current_admin


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# ADMIN STATISTICS
# =========================================================

@router.get("/stats")
async def get_admin_stats(
    current_admin: str = Depends(get_current_admin)
):
    total_users = await users_collection.count_documents({})

    pipeline = [
        {
            "$group": {
                "_id": "$reading_type",
                "count": {"$sum": 1}
            }
        }
    ]

    results = await readings_collection.aggregate(
        pipeline
    ).to_list(length=None)

    stats = {
        "palm": 0,
        "tarot": 0,
        "combined": 0
    }

    for result in results:
        reading_type = result.get("_id")

        if reading_type in stats:
            stats[reading_type] = result["count"]

    total_readings = sum(stats.values())

    return {
        "total_users": total_users,
        "palm_readings": stats["palm"],
        "tarot_readings": stats["tarot"],
        "combined_readings": stats["combined"],
        "total_readings": total_readings
    }


# =========================================================
# GET ALL USERS
# =========================================================

@router.get("/users")
async def get_all_users(
    current_admin: str = Depends(get_current_admin)
):
    cursor = users_collection.find(
        {},
        {
            "hashed_password": 0
        }
    ).sort("created_at", -1)

    users = []

    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)

    return {
        "users": users,
        "total": len(users)
    }


# =========================================================
# GET ALL READINGS
# =========================================================

@router.get("/readings")
async def get_all_readings(
    current_admin: str = Depends(get_current_admin)
):
    cursor = readings_collection.find({}).sort(
        "created_at",
        -1
    )

    readings = []

    async for reading in cursor:
        reading["_id"] = str(reading["_id"])

        readings.append(reading)

    return {
        "readings": readings,
        "total": len(readings)
    }


# =========================================================
# GET READINGS FOR ONE USER
# =========================================================

@router.get("/users/{user_id}/readings")
async def get_user_readings_admin(
    user_id: str,
    current_admin: str = Depends(get_current_admin)
):
    # Validate user ID
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    # Check user exists
    user = await users_collection.find_one(
        {"_id": object_id},
        {
            "hashed_password": 0
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Readings are linked using email
    cursor = readings_collection.find(
        {
            "user_email": user["email"]
        }
    ).sort(
        "created_at",
        -1
    )

    readings = []

    async for reading in cursor:
        reading["_id"] = str(reading["_id"])
        readings.append(reading)

    return {
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role", "user")
        },
        "readings": readings,
        "total": len(readings)
    }


# =========================================================
# DELETE USER + ALL THEIR READINGS
# =========================================================

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: str = Depends(get_current_admin)
):
    # Validate MongoDB ObjectId
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    # Find user
    user = await users_collection.find_one(
        {"_id": object_id}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Never allow admin accounts to be deleted
    if user.get("role") == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin accounts cannot be deleted"
        )

    # Delete all readings belonging to the user
    readings_result = await readings_collection.delete_many(
        {
            "user_email": user["email"]
        }
    )

    # Delete user
    user_result = await users_collection.delete_one(
        {
            "_id": object_id
        }
    )

    if user_result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User could not be deleted"
        )

    return {
        "success": True,
        "message": "User and associated readings deleted successfully",
        "deleted_readings": readings_result.deleted_count
    }


# =========================================================
# DELETE INDIVIDUAL READING
# =========================================================

@router.delete("/readings/{reading_id}")
async def delete_reading(
    reading_id: str,
    current_admin: str = Depends(get_current_admin)
):
    # Validate ObjectId
    try:
        object_id = ObjectId(reading_id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid reading ID"
        )

    # Check reading exists
    reading = await readings_collection.find_one(
        {
            "_id": object_id
        }
    )

    if not reading:
        raise HTTPException(
            status_code=404,
            detail="Reading not found"
        )

    # Delete reading
    result = await readings_collection.delete_one(
        {
            "_id": object_id
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Reading could not be deleted"
        )

    return {
        "success": True,
        "message": "Reading deleted successfully"
    }