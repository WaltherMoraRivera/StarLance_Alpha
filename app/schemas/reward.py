from pydantic import BaseModel
from typing import Optional


class RewardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cost: int
    family_id: str


class RewardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[int] = None


class RewardResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    cost: int
    family_id: str
