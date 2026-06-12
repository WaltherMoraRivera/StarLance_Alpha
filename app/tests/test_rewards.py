import pytest
from httpx import AsyncClient
from fastapi import status
import pytest_asyncio

# Mark all tests in this file as async
pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_family_and_reward(client: AsyncClient):
    """Create a family and reward once for all reward tests in this module."""
    # Create family
    response = await client.post("/families/", json={
        "name": "Reward Test Family",
        "members": [
            {"id": "reward_child_01", "name": "Reward Child", "role": "child", "balance": 200},
            {"id": "reward_parent_01", "name": "Reward Parent", "role": "parent", "balance": 0},
        ]
    })
    family_data = response.json()
    family_id = family_data["_id"]
    child_id = family_data["members"][0]["id"]
    
    # Create reward
    response = await client.post("/rewards/", json={
        "name": "Test Reward",
        "cost": 50,
        "family_id": family_id
    })
    reward_data = response.json()
    reward_id = reward_data["_id"]
    
    yield {"family_id": family_id, "child_id": child_id, "reward_id": reward_id}


async def test_create_reward(client: AsyncClient):
    """Test creating a new reward."""
    response = await client.post("/families/", json={
        "name": "Create Reward Family",
        "members": [{"id": "reward_test_01", "name": "Test", "role": "child", "balance": 0}]
    })
    family_id = response.json()["_id"]
    
    response = await client.post("/rewards/", json={
        "name": "New Reward",
        "cost": 50,
        "family_id": family_id
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "New Reward"
    assert data["cost"] == 50


async def test_get_reward_by_id(client: AsyncClient, setup_family_and_reward):
    """Test retrieving a reward by its ID."""
    reward_id = setup_family_and_reward["reward_id"]
    response = await client.get(f"/rewards/{reward_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["_id"] == reward_id
    assert data["name"] == "Test Reward"


async def test_get_rewards_by_family(client: AsyncClient, setup_family_and_reward):
    """Test retrieving all rewards for a specific family."""
    family_id = setup_family_and_reward["family_id"]
    response = await client.get(f"/rewards/?family_id={family_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["family_id"] == family_id


async def test_redeem_reward_and_check_balance(client: AsyncClient, setup_family_and_reward):
    """Test redeeming a reward and verifying the balance deduction."""
    child_id = setup_family_and_reward["child_id"]
    reward_id = setup_family_and_reward["reward_id"]
    
    # 1. Redeem the reward
    response = await client.post(
        "/rewards/redeem",
        json={"user_id": child_id, "reward_id": reward_id}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["detail"] == "Reward redeemed successfully!"

    # 2. Check the child's balance (initial 200 - 50 cost)
    response = await client.get(f"/balance/{child_id}")
    assert response.status_code == status.HTTP_200_OK
    balance_data = response.json()
    assert balance_data["balance"] == 150


async def test_redeem_reward_insufficient_funds(client: AsyncClient, setup_family_and_reward):
    """Test attempting to redeem a reward with insufficient funds."""
    family_id = setup_family_and_reward["family_id"]
    child_id = setup_family_and_reward["child_id"]
    
    # Create a very expensive reward
    response = await client.post("/rewards/", json={
        "name": "Expensive Reward",
        "cost": 1000,
        "family_id": family_id
    })
    assert response.status_code == status.HTTP_201_CREATED
    expensive_reward_id = response.json()["_id"]

    # Attempt to redeem it
    response = await client.post(
        "/rewards/redeem",
        json={"user_id": child_id, "reward_id": expensive_reward_id}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Insufficient balance" in response.json()["detail"]


async def test_delete_reward(client: AsyncClient, setup_family_and_reward):
    """Test deleting a reward."""
    reward_id = setup_family_and_reward["reward_id"]
    response = await client.delete(f"/rewards/{reward_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify the reward is gone
    response = await client.get(f"/rewards/{reward_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

