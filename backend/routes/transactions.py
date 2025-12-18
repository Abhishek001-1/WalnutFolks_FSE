from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
from ..schemas.models import TransactionIn, TransactionOut
from ..db import storage
from .tasks import process_transaction

router = APIRouter()


@router.post("/v1/webhooks/transactions", status_code=202)
async def receive_webhook(tx: TransactionIn, background_tasks: BackgroundTasks):
    txd = tx.dict()
    txd["created_at"] = datetime.utcnow().isoformat() + "Z"
    inserted = storage.insert_if_not_exists(txd)
    if inserted:
        background_tasks.add_task(process_transaction, tx.transaction_id)
    return JSONResponse(status_code=202, content={})


@router.get("/v1/transactions/{transaction_id}")
def get_transaction(transaction_id: str):
    tx = storage.get_transaction(transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="transaction not found")
    out = TransactionOut(
        transaction_id=tx["transaction_id"],
        source_account=tx["source_account"],
        destination_account=tx["destination_account"],
        amount=tx["amount"],
        currency=tx["currency"],
        status=tx["status"],
        created_at=datetime.fromisoformat(tx["created_at"].replace("Z", "+00:00")),
        processed_at=(
            None
            if not tx.get("processed_at")
            else datetime.fromisoformat(tx["processed_at"].replace("Z", "+00:00"))
        ),
    )
    return [out]
