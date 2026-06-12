from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class MemberRole(str, Enum):
    parent = "parent"
    child = "child"


class Member(BaseModel):
    id: str
    name: str
    role: MemberRole
    balance: int = 0


class FamilyCreate(BaseModel):
    name: str
    members: List[Member]


class FamilyUpdate(BaseModel):
    name: Optional[str] = None
    members: Optional[List[Member]] = None


class FamilyResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    members: List[Member]
