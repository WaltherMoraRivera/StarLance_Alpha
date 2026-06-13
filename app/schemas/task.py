from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    approved = "approved"
    rejected = "rejected"


class TaskType(str, Enum):
    daily = "daily"
    weekly = "weekly"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    points: int
    assigned_to_id: str
    family_id: str
    task_type: TaskType
    task_date: Optional[str] = None
    icon: Optional[str] = "⭐"
    catalog_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    points: Optional[int] = None
    status: Optional[TaskStatus] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    points: int
    assigned_to_id: str
    family_id: str
    status: TaskStatus = TaskStatus.pending
    task_type: TaskType
    task_date: Optional[str] = None
    icon: Optional[str] = "⭐"
    catalog_id: Optional[str] = None
    created_at: datetime
