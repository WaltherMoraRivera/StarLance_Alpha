import pytest
from httpx import AsyncClient
from fastapi import status

# Mark all tests in this file as async
pytestmark = pytest.mark.asyncio

# Global variable to store the created family ID
family_id: str


async def test_create_family(client: AsyncClient):
    """Test creating a new family."""
    global family_id
    response = await client.post("/families/", json={
        "name": "Main Test Family",
        "members": [
            {"id": "main_child_01", "name": "Main Child", "role": "child", "balance": 10},
            {"id": "main_parent_01", "name": "Main Parent", "role": "parent", "balance": 0},
        ]
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Main Test Family"
    assert len(data["members"]) == 2
    family_id = data["_id"]


async def test_get_all_families(client: AsyncClient):
    """Test retrieving all families."""
    response = await client.get("/families/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_get_family_by_id(client: AsyncClient):
    """Test retrieving a single family by its ID."""
    response = await client.get(f"/families/{family_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["_id"] == family_id
    assert data["name"] == "Main Test Family"


async def test_update_family(client: AsyncClient):
    """Test updating a family's name."""
    response = await client.patch(f"/families/{family_id}", json={"name": "Updated Family Name"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Family Name"


async def test_delete_family(client: AsyncClient):
    """Test deleting a family."""
    response = await client.delete(f"/families/{family_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the family is gone
    response = await client.get(f"/families/{family_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
