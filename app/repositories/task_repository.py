from bson import ObjectId
from typing import List, Optional
from datetime import datetime, timezone
from app.db.mongodb import get_database
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatus


def _task_helper(task) -> dict:
    return {
        "_id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "points": task["points"],
        "assigned_to_id": task["assigned_to_id"],
        "family_id": task["family_id"],
        "status": task["status"],
        "task_type": task["task_type"],
        "created_at": task["created_at"],
    }


async def get_all_tasks() -> List[dict]:
    db = get_database()
    collection = db.tasks
    tasks = []
    async for task in collection.find():
        tasks.append(_task_helper(task))
    return tasks


async def get_task_by_id(task_id: str) -> Optional[dict]:
    db = get_database()
    collection = db.tasks
    if not ObjectId.is_valid(task_id):
        return None
    task = await collection.find_one({"_id": ObjectId(task_id)})
    if task:
        return _task_helper(task)
    return None


async def get_tasks_by_user(user_id: str) -> List[dict]:
    db = get_database()
    collection = db.tasks
    tasks = []
    async for task in collection.find({"assigned_to_id": user_id}):
        tasks.append(_task_helper(task))
    return tasks


async def create_task(task_data: TaskCreate) -> dict:
    db = get_database()
    collection = db.tasks
    task_dict = task_data.model_dump()
    task_dict["status"] = TaskStatus.pending
    task_dict["created_at"] = datetime.now(timezone.utc)
    result = await collection.insert_one(task_dict)
    new_task = await collection.find_one({"_id": result.inserted_id})
    return _task_helper(new_task)


async def update_task(task_id: str, task_data: TaskUpdate) -> Optional[dict]:
    db = get_database()
    collection = db.tasks
    if not ObjectId.is_valid(task_id):
        return None
    update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}

    if len(update_data) >= 1:
        await collection.update_one(
            {"_id": ObjectId(task_id)}, {"$set": update_data}
        )
    
    updated_task = await collection.find_one({"_id": ObjectId(task_id)})
    if updated_task:
        return _task_helper(updated_task)
    return None


async def delete_task(task_id: str) -> bool:
    db = get_database()
    collection = db.tasks
    if not ObjectId.is_valid(task_id):
        return False
    result = await collection.delete_one({"_id": ObjectId(task_id)})
    return result.deleted_count > 0
