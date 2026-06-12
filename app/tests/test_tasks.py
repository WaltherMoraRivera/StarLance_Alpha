import pytest
from httpx import AsyncClient
from fastapi import status
from app.schemas.task import TaskStatus

# Mark all tests in this file as async
pytestmark = pytest.mark.asyncio

# Global variables to store created IDs
family_id: str
child_id: str
parent_id: str


async def test_create_family_for_tasks(client: AsyncClient):
    """Create a family to be used in subsequent task tests."""
    global family_id, child_id, parent_id
    response = await client.post("/families/", json={
        "name": "Task Test Family",
        "members": [
            {"id": "test_child_01", "name": "Test Child", "role": "child", "balance": 0},
            {"id": "test_parent_01", "name": "Test Parent", "role": "parent", "balance": 0},
        ]
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    family_id = data["_id"]
    child_id = data["members"][0]["id"]
    parent_id = data["members"][1]["id"]
    assert family_id is not None


async def test_create_task(client: AsyncClient):
    """Test creating a new task."""
    response = await client.post("/tasks/", json={
        "title": "Test Task",
        "points": 100,
        "assigned_to_id": child_id,
        "family_id": family_id,
        "task_type": "daily"
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["status"] == TaskStatus.pending
    assert data["assigned_to_id"] == child_id
    pytest.task_id = data["_id"]  # Save task_id for other tests


async def test_get_task_by_id(client: AsyncClient):
    """Test retrieving a task by its ID."""
    assert hasattr(pytest, "task_id"), "Task ID not set"
    response = await client.get(f"/tasks/{pytest.task_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["_id"] == pytest.task_id
    assert data["title"] == "Test Task"


async def test_get_tasks_by_user(client: AsyncClient):
    """Test retrieving all tasks assigned to a specific user."""
    response = await client.get(f"/tasks/?user_id={child_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["assigned_to_id"] == child_id


async def test_complete_task(client: AsyncClient):
    """Test marking a task as completed."""
    assert hasattr(pytest, "task_id"), "Task ID not set"
    response = await client.patch(f"/tasks/{pytest.task_id}", json={"status": TaskStatus.completed})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == TaskStatus.completed


async def test_approve_task_and_check_balance(client: AsyncClient):
    """Test approving a task and verifying the balance update."""
    assert hasattr(pytest, "task_id"), "Task ID not set"

    # 1. Approve the task
    response = await client.patch(
        f"/tasks/{pytest.task_id}/approve",
        json={"approver_id": parent_id}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == TaskStatus.approved

    # 2. Check the child's balance
    response = await client.get(f"/balance/{child_id}")
    assert response.status_code == status.HTTP_200_OK
    balance_data = response.json()
    assert balance_data["user_id"] == child_id
    assert balance_data["balance"] == 100  # Points from the approved task


async def test_delete_task(client: AsyncClient):
    """Test deleting a task."""
    assert hasattr(pytest, "task_id"), "Task ID not set"
    response = await client.delete(f"/tasks/{pytest.task_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the task is gone
    response = await client.get(f"/tasks/{pytest.task_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

