from fastapi import APIRouter, Body, status
from typing import List, Optional
from app.schemas.reward import RewardCreate, RewardUpdate, RewardResponse
from app.services import reward_service

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.post("/", response_model=RewardResponse, status_code=status.HTTP_201_CREATED)
async def create_reward(reward: RewardCreate):
    return await reward_service.create_reward_service(reward)


@router.get("/", response_model=List[RewardResponse])
async def get_rewards(family_id: Optional[str] = None):
    if family_id:
        return await reward_service.get_rewards_by_family_service(family_id)
    return await reward_service.get_all_rewards_service()


@router.get("/{reward_id}", response_model=RewardResponse)
async def get_reward(reward_id: str):
    return await reward_service.get_reward_by_id_service(reward_id)


@router.patch("/{reward_id}", response_model=RewardResponse)
async def update_reward(reward_id: str, reward: RewardUpdate):
    return await reward_service.update_reward_service(reward_id, reward)


@router.post("/redeem", status_code=status.HTTP_200_OK)
async def redeem_reward(
    user_id: str = Body(..., embed=True),
    reward_id: str = Body(..., embed=True),
):
    return await reward_service.redeem_reward_service(user_id, reward_id)


@router.delete("/{reward_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reward(reward_id: str):
    await reward_service.delete_reward_service(reward_id)
    return {}
