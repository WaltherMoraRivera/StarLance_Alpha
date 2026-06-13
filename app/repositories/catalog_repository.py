from bson import ObjectId
from typing import List, Optional
from app.db.mongodb import get_database
from app.schemas.catalog import CatalogTaskCreate, CatalogTaskUpdate


def _helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "description": doc.get("description"),
        "stars": doc["stars"],
        "icon": doc.get("icon", "⭐"),
        "is_active": doc.get("is_active", True),
    }


async def get_all_catalog_tasks(active_only: bool = False) -> List[dict]:
    db = get_database()
    query = {"is_active": True} if active_only else {}
    return [_helper(doc) async for doc in db.task_catalog.find(query)]


async def get_catalog_task_by_id(task_id: str) -> Optional[dict]:
    db = get_database()
    if not ObjectId.is_valid(task_id):
        return None
    doc = await db.task_catalog.find_one({"_id": ObjectId(task_id)})
    return _helper(doc) if doc else None


async def create_catalog_task(data: CatalogTaskCreate) -> dict:
    db = get_database()
    result = await db.task_catalog.insert_one(data.model_dump())
    doc = await db.task_catalog.find_one({"_id": result.inserted_id})
    return _helper(doc)


async def update_catalog_task(task_id: str, data: CatalogTaskUpdate) -> Optional[dict]:
    db = get_database()
    if not ObjectId.is_valid(task_id):
        return None
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if update:
        await db.task_catalog.update_one({"_id": ObjectId(task_id)}, {"$set": update})
    doc = await db.task_catalog.find_one({"_id": ObjectId(task_id)})
    return _helper(doc) if doc else None


async def delete_catalog_task(task_id: str) -> bool:
    db = get_database()
    if not ObjectId.is_valid(task_id):
        return False
    result = await db.task_catalog.delete_one({"_id": ObjectId(task_id)})
    return result.deleted_count > 0
