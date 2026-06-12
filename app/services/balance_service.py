from typing import List
from app.repositories import transaction_repository, family_repository
from app.schemas.transaction import TransactionCreate, TransactionType
from app.schemas.family import Member


async def get_balance_service(user_id: str) -> dict:
    transactions = await transaction_repository.get_transactions_by_user(user_id)
    
    balance = 0
    for t in transactions:
        if t["transaction_type"] == TransactionType.earn:
            balance += t["points"]
        elif t["transaction_type"] == TransactionType.redeem:
            balance -= t["points"]
            
    return {"user_id": user_id, "balance": balance}


async def get_total_balance_service(user_id: str) -> dict:
    """Get total balance including initial balance from family document."""
    # Get transaction balance
    transaction_balance = 0
    transactions = await transaction_repository.get_transactions_by_user(user_id)
    for t in transactions:
        if t["transaction_type"] == TransactionType.earn:
            transaction_balance += t["points"]
        elif t["transaction_type"] == TransactionType.redeem:
            transaction_balance -= t["points"]
    
    # Get initial balance from family member document
    initial_balance = 0
    families = await family_repository.get_all_families()
    for family in families:
        for member in family.get("members", []):
            if member.get("id") == user_id:
                initial_balance = member.get("balance", 0)
                break
    
    total_balance = initial_balance + transaction_balance
    return {"user_id": user_id, "balance": total_balance}


async def get_transactions_service(user_id: str) -> List[dict]:
    return await transaction_repository.get_transactions_by_user(user_id)


async def add_points_for_task(user_id: str, points: int, task_id: str) -> dict:
    transaction_data = TransactionCreate(
        user_id=user_id,
        transaction_type=TransactionType.earn,
        points=points,
        task_id=task_id,
    )
    return await transaction_repository.create_transaction(transaction_data)


async def redeem_points_for_reward(user_id: str, points: int, reward_id: str) -> dict:
    transaction_data = TransactionCreate(
        user_id=user_id,
        transaction_type=TransactionType.redeem,
        points=points,
        task_id=reward_id,  # Using task_id to store reward_id for simplicity
    )
    return await transaction_repository.create_transaction(transaction_data)


async def check_sufficient_balance(user_id: str, amount: int) -> bool:
    balance_data = await get_total_balance_service(user_id)
    return balance_data["balance"] >= amount


async def update_member_balance(family_id: str, user_id: str, new_balance: int) -> Member:
    family = await family_repository.get_family_by_id(family_id)
    
    member_to_update = None
    for member in family["members"]:
        if member["id"] == user_id:
            member["balance"] = new_balance
            member_to_update = member
            break
    
    if member_to_update:
        await family_repository.update_family(family_id, {"members": family["members"]})
        return Member(**member_to_update)
    
    return None
