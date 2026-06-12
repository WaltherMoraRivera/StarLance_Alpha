from fastapi import HTTPException, status
from typing import List, Optional
from app.repositories import reward_repository, family_repository
from app.schemas.reward import RewardCreate, RewardUpdate
from app.services import balance_service


async def create_reward_service(reward_data: RewardCreate) -> dict:
    family = await family_repository.get_family_by_id(reward_data.family_id)
    if not family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
    return await reward_repository.create_reward(reward_data)


async def get_all_rewards_service() -> List[dict]:
    return await reward_repository.get_all_rewards()


async def get_reward_by_id_service(reward_id: str) -> Optional[dict]:
    reward = await reward_repository.get_reward_by_id(reward_id)
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    return reward


async def get_rewards_by_family_service(family_id: str) -> List[dict]:
    return await reward_repository.get_rewards_by_family(family_id)


async def update_reward_service(reward_id: str, reward_data: RewardUpdate) -> Optional[dict]:
    updated_reward = await reward_repository.update_reward(reward_id, reward_data)
    if not updated_reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    return updated_reward


async def redeem_reward_service(user_id: str, reward_id: str) -> dict:
    reward = await get_reward_by_id_service(reward_id)

    # 1. Validate user and family
    family = await family_repository.get_family_by_id(reward["family_id"])
    if not family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")

    user = next((member for member in family["members"] if member["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in family")

    # 2. Check balance
    can_redeem = await balance_service.check_sufficient_balance(user_id, reward["cost"])
    if not can_redeem:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance to redeem this reward.",
        )

    # 3. Deduct points
    transaction = await balance_service.redeem_points_for_reward(
        user_id=user_id,
        points=reward["cost"],
        reward_id=reward_id,
    )

    return {
        "detail": "Reward redeemed successfully!",
        "transaction": transaction,
    }


async def delete_reward_service(reward_id: str) -> None:
    deleted = await reward_repository.delete_reward(reward_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    return {"detail": "Reward deleted successfully"}
