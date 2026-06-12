from fastapi import APIRouter, Body, status
from typing import List, Optional
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate):
    return await task_service.create_task_service(task)


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(user_id: Optional[str] = None):
    if user_id:
        return await task_service.get_tasks_by_user_service(user_id)
    return await task_service.get_all_tasks_service()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    return await task_service.get_task_by_id_service(task_id)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: TaskUpdate):
    return await task_service.update_task_service(task_id, task)


@router.patch("/{task_id}/approve", response_model=TaskResponse)
async def approve_task(task_id: str, approver_id: str = Body(..., embed=True)):
    return await task_service.approve_task_service(task_id, approver_id)


@router.patch("/{task_id}/reject", response_model=TaskResponse)
async def reject_task(task_id: str):
    return await task_service.reject_task_service(task_id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    await task_service.delete_task_service(task_id)
    return {}
