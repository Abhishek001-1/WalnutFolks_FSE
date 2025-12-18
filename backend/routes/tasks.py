import asyncio
from ..db.storage import get_transaction, mark_processed


async def process_transaction(transaction_id: str):
    """Background processing: simulate external call delay then mark processed."""
    await asyncio.sleep(30)
    tx = get_transaction(transaction_id)
    if not tx:
        return
    mark_processed(transaction_id)
