from fastapi import APIRouter, Body, HTTPException
from typing import List
from app.schemas.transaction import BalanceResponse, TransactionResponse
from app.services import balance_service

router = APIRouter(tags=["Balance & Transactions"])


@router.get("/balance/{user_id}", response_model=BalanceResponse)
async def get_balance(user_id: str):
    return await balance_service.get_total_balance_service(user_id)


@router.get("/transactions/{user_id}", response_model=List[TransactionResponse])
async def get_transactions(user_id: str):
    return await balance_service.get_transactions_service(user_id)


@router.post("/balance/{user_id}/adjust")
async def adjust_balance(user_id: str, new_total: int = Body(..., embed=True)):
    """Set a user's total balance to a specific value (admin use)."""
    current = await balance_service.get_total_balance_service(user_id)
    delta = new_total - current["balance"]
    if delta == 0:
        return {"user_id": user_id, "balance": new_total}
    from app.repositories import transaction_repository
    from app.schemas.transaction import TransactionCreate, TransactionType
    tx = TransactionCreate(
        user_id=user_id,
        transaction_type=TransactionType.earn if delta > 0 else TransactionType.redeem,
        points=abs(delta),
    )
    await transaction_repository.create_transaction(tx)
    return {"user_id": user_id, "balance": new_total}
