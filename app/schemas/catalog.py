from pydantic import BaseModel
from typing import Optional


class CatalogTaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    stars: int
    icon: str = "⭐"
    is_active: bool = True


class CatalogTaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    stars: Optional[int] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None


class CatalogTaskResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    stars: int
    icon: str
    is_active: bool
