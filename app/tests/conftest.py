import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from mongomock_motor import AsyncMongoMockClient
from app.main import app
from app.db import mongodb
from app.core.config import settings


@pytest_asyncio.fixture(scope="session")
async def client():
    """
    Async test client that handles startup and shutdown of the app.
    Uses mongomock to avoid requiring a real MongoDB instance.
    """
    # Create a mongomock client for testing
    mock_client = AsyncMongoMockClient()
    mock_db = mock_client[settings.DATABASE_NAME]
    
    # Patch the mongodb module to use mongomock
    mongodb.client = mock_client
    mongodb.db = mock_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Clean up database before tests
        await mock_db.families.delete_many({})
        await mock_db.tasks.delete_many({})
        await mock_db.rewards.delete_many({})
        await mock_db.transactions.delete_many({})
        yield ac

