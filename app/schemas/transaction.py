from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional


class TransactionType(str, Enum):
    earn = "earn"
    redeem = "redeem"


class TransactionCreate(BaseModel):
    user_id: str
    transaction_type: TransactionType
    points: int
    task_id: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    transaction_type: TransactionType
    points: int
    task_id: Optional[str] = None
    created_at: datetime


class BalanceResponse(BaseModel):
    user_id: str
    balance: int
