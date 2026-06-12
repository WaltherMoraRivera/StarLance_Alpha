from bson import ObjectId
from typing import List, Optional
from app.db.mongodb import get_database
from app.schemas.family import FamilyCreate, FamilyUpdate


def _family_helper(family) -> dict:
    return {
        "_id": str(family["_id"]),
        "name": family["name"],
        "members": family["members"],
    }


async def get_all_families() -> List[dict]:
    db = get_database()
    collection = db.families
    families = []
    async for family in collection.find():
        families.append(_family_helper(family))
    return families


async def get_family_by_id(family_id: str) -> Optional[dict]:
    db = get_database()
    collection = db.families
    if not ObjectId.is_valid(family_id):
        return None
    family = await collection.find_one({"_id": ObjectId(family_id)})
    if family:
        return _family_helper(family)
    return None


async def create_family(family_data: FamilyCreate) -> dict:
    db = get_database()
    collection = db.families
    family_dict = family_data.model_dump()
    result = await collection.insert_one(family_dict)
    new_family = await collection.find_one({"_id": result.inserted_id})
    return _family_helper(new_family)


async def update_family(family_id: str, family_data: FamilyUpdate) -> Optional[dict]:
    db = get_database()
    collection = db.families
    if not ObjectId.is_valid(family_id):
        return None
    update_data = {k: v for k, v in family_data.model_dump().items() if v is not None}

    if len(update_data) >= 1:
        await collection.update_one(
            {"_id": ObjectId(family_id)}, {"$set": update_data}
        )
    
    updated_family = await collection.find_one({"_id": ObjectId(family_id)})
    if updated_family:
        return _family_helper(updated_family)
    return None


async def delete_family(family_id: str) -> bool:
    db = get_database()
    collection = db.families
    if not ObjectId.is_valid(family_id):
        return False
    result = await collection.delete_one({"_id": ObjectId(family_id)})
    return result.deleted_count > 0
