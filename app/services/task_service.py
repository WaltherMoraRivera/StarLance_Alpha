from fastapi import HTTPException, status
from typing import List, Optional
from app.repositories import task_repository, family_repository
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatus, TaskResponse
from app.services import balance_service


async def create_task_service(task_data: TaskCreate) -> dict:
    # Validate that assigned_to_id and family_id exist
    family = await family_repository.get_family_by_id(task_data.family_id)
    if not family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")

    member_ids = [member['id'] for member in family['members']]
    if task_data.assigned_to_id not in member_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned user not found in family")

    return await task_repository.create_task(task_data)


async def get_all_tasks_service() -> List[dict]:
    return await task_repository.get_all_tasks()


async def get_task_by_id_service(task_id: str) -> Optional[dict]:
    task = await task_repository.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


async def get_tasks_by_user_service(user_id: str) -> List[dict]:
    return await task_repository.get_tasks_by_user(user_id)


async def update_task_service(task_id: str, task_data: TaskUpdate) -> Optional[dict]:
    updated_task = await task_repository.update_task(task_id, task_data)
    if not updated_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return updated_task


async def approve_task_service(task_id: str, approver_id: str) -> dict:
    task = await get_task_by_id_service(task_id)

    # 1. Validate task status
    if task["status"] != TaskStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task must be in '{TaskStatus.completed}' status to be approved.",
        )

    # 2. Validate approver role
    family = await family_repository.get_family_by_id(task["family_id"])
    if not family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")

    approver = next((member for member in family["members"] if member["id"] == approver_id), None)
    if not approver or approver["role"] != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can approve tasks.",
        )

    # 3. Update task status to approved
    update_data = TaskUpdate(status=TaskStatus.approved)
    updated_task = await task_repository.update_task(task_id, update_data)

    # 4. Add points to user's balance
    await balance_service.add_points_for_task(
        user_id=task["assigned_to_id"],
        points=task["points"],
        task_id=task_id,
    )

    return updated_task


async def reject_task_service(task_id: str) -> dict:
    task = await get_task_by_id_service(task_id)
    if task["status"] != TaskStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden rechazar tareas en estado 'completed'.",
        )
    return await task_repository.update_task(task_id, TaskUpdate(status=TaskStatus.rejected))


async def delete_task_service(task_id: str) -> None:
    deleted = await task_repository.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return {"detail": "Task deleted successfully"}
