from bson import ObjectId
from typing import List, Optional
from app.db.mongodb import get_database
from app.schemas.reward import RewardCreate, RewardUpdate


def _reward_helper(reward) -> dict:
    return {
        "_id": str(reward["_id"]),
        "name": reward["name"],
        "description": reward.get("description"),
        "cost": reward["cost"],
        "family_id": reward["family_id"],
    }


async def get_all_rewards() -> List[dict]:
    db = get_database()
    collection = db.rewards
    rewards = []
    async for reward in collection.find():
        rewards.append(_reward_helper(reward))
    return rewards


async def get_reward_by_id(reward_id: str) -> Optional[dict]:
    db = get_database()
    collection = db.rewards
    if not ObjectId.is_valid(reward_id):
        return None
    reward = await collection.find_one({"_id": ObjectId(reward_id)})
    if reward:
        return _reward_helper(reward)
    return None


async def get_rewards_by_family(family_id: str) -> List[dict]:
    db = get_database()
    collection = db.rewards
    rewards = []
    async for reward in collection.find({"family_id": family_id}):
        rewards.append(_reward_helper(reward))
    return rewards


async def create_reward(reward_data: RewardCreate) -> dict:
    db = get_database()
    collection = db.rewards
    reward_dict = reward_data.model_dump()
    result = await collection.insert_one(reward_dict)
    new_reward = await collection.find_one({"_id": result.inserted_id})
    return _reward_helper(new_reward)


async def update_reward(reward_id: str, reward_data: RewardUpdate) -> Optional[dict]:
    db = get_database()
    collection = db.rewards
    if not ObjectId.is_valid(reward_id):
        return None
    update_data = {k: v for k, v in reward_data.model_dump().items() if v is not None}

    if len(update_data) >= 1:
        await collection.update_one(
            {"_id": ObjectId(reward_id)}, {"$set": update_data}
        )
    
    updated_reward = await collection.find_one({"_id": ObjectId(reward_id)})
    if updated_reward:
        return _reward_helper(updated_reward)
    return None


async def delete_reward(reward_id: str) -> bool:
    db = get_database()
    collection = db.rewards
    if not ObjectId.is_valid(reward_id):
        return False
    result = await collection.delete_one({"_id": ObjectId(reward_id)})
    return result.deleted_count > 0
