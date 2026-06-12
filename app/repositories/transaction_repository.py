from bson import ObjectId
from typing import List
from datetime import datetime, timezone
from app.db.mongodb import get_database
from app.schemas.transaction import TransactionCreate


def _transaction_helper(transaction) -> dict:
    return {
        "_id": str(transaction["_id"]),
        "user_id": transaction["user_id"],
        "transaction_type": transaction["transaction_type"],
        "points": transaction["points"],
        "task_id": transaction.get("task_id"),
        "created_at": transaction["created_at"],
    }


async def create_transaction(transaction_data: TransactionCreate) -> dict:
    db = get_database()
    collection = db.transactions
    transaction_dict = transaction_data.model_dump()
    transaction_dict["created_at"] = datetime.now(timezone.utc)
    result = await collection.insert_one(transaction_dict)
    new_transaction = await collection.find_one({"_id": result.inserted_id})
    return _transaction_helper(new_transaction)


async def get_transactions_by_user(user_id: str) -> List[dict]:
    db = get_database()
    collection = db.transactions
    transactions = []
    # Sort by creation date descending
    cursor = collection.find({"user_id": user_id}).sort("created_at", -1)
    async for transaction in cursor:
        transactions.append(_transaction_helper(transaction))
    return transactions
