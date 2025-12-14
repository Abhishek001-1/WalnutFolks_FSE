# Webhook Transactions Service (FastAPI)

This is a small FastAPI service that accepts transaction webhooks, acknowledges them quickly (202 Accepted), and processes transactions in the background with a simulated 30s external call. Transactions are stored in MongoDB and idempotency is enforced using a unique index on `transaction_id`.

API endpoints
- POST /v1/webhooks/transactions  -> accept webhooks (returns 202 immediately)
- GET /                         -> health check
- GET /v1/transactions/{transaction_id} -> retrieve stored transaction status


Run locally

Prerequisite: a running MongoDB instance. You can use a local MongoDB server or a hosted provider. MongoDB Compass and server are already running if you've opened them.

1. Create a virtual environment and install deps:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
```

2. (Optional) Set MongoDB connection string via env var (defaults to mongodb://localhost:27017):

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017"
```

3. Start the app:

```powershell
python main.py
```

Test the flow (same as before):

```powershell
curl -X POST http://localhost:8000/v1/webhooks/transactions -H "Content-Type: application/json" -d '{"transaction_id":"txn_abc123def456","source_account":"acc_user_789","destination_account":"acc_merchant_456","amount":1500,"currency":"INR"}'

curl http://localhost:8000/v1/transactions/txn_abc123def456
```

Notes / choices
- MongoDB chosen for persistent storage; configure `MONGODB_URI` to point to your cluster.
- Background processing uses FastAPI's BackgroundTasks + asyncio.sleep to simulate external latency.
- Idempotency enforced via unique index on `transaction_id` and handling DuplicateKeyError on inserts.
