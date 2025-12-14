from typing import Optional, Dict
from datetime import datetime
import os

from pymongo import MongoClient, errors

_client: Optional[MongoClient] = None
_db = None
_col = None


def _get_client():
    global _client, _db, _col
    if _client is None:
        mongo_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
        _client = MongoClient(mongo_uri)
        _db = _client.get_database("webhooks_db")
        _col = _db.get_collection("transactions")
    return _client, _db, _col


def init_db():
    """Ensure indexes exist (unique index on transaction_id)."""
    _, db, col = _get_client()
    # create unique index for idempotency
    try:
        col.create_index("transaction_id", unique=True)
    except errors.PyMongoError:
        # best-effort; caller may inspect logs
        pass


def insert_if_not_exists(tx: Dict) -> bool:
    """Insert document; return True if inserted, False if already exists."""
    _, db, col = _get_client()
    doc = tx.copy()
    doc.setdefault("status", "PROCESSING")
    doc.setdefault("created_at", datetime.utcnow().isoformat() + "Z")
    try:
        col.insert_one(doc)
        return True
    except errors.DuplicateKeyError:
        return False


def get_transaction(transaction_id: str) -> Optional[Dict]:
    _, db, col = _get_client()
    doc = col.find_one({"transaction_id": transaction_id}, {"_id": 0})
    return doc


def mark_processed(transaction_id: str):
    _, db, col = _get_client()
    processed_at = datetime.utcnow().isoformat() + "Z"
    col.update_one(
        {"transaction_id": transaction_id},
        {"$set": {"status": "PROCESSED", "processed_at": processed_at}},
    )

