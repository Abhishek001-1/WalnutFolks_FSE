# WalnutFolks_FSE

This repository contains a small webhook transactions backend (FastAPI + MongoDB) and a Vite + React frontend dashboard (TypeScript + Supabase fallback).

**Contents**
- **Backend**: FastAPI service that accepts transaction webhooks, stores them in MongoDB, and processes them in the background.
- **Frontend**: Vite + React dashboard showing charts, allows saving user values to Supabase (or localStorage fallback).

**Quick links**
- Backend entry: [backend/main.py](backend/main.py#L1)
- Backend routes: [backend/routes/health.py](backend/routes/health.py#L1), [backend/routes/transactions.py](backend/routes/transactions.py#L1)
- Frontend app: [frontend/src/App.tsx](frontend/src/App.tsx#L1)
- Supabase client: [frontend/src/supabaseClient.ts](frontend/src/supabaseClient.ts#L1)

--

**Backend**

- Location: `backend/`
- Language / stack: Python, FastAPI, Uvicorn, PyMongo (MongoDB client).

What it does
- Receives transaction webhooks and stores them in MongoDB (idempotent by `transaction_id`).
- Background task simulates processing (30s) and marks transactions as processed.

Requirements
- Python 3.10+ recommended.
- MongoDB (local or remote). By default the code uses `mongodb://localhost:27017` unless you set `MONGODB_URI`.

Install

```bash
cd backend
python -m pip install -r requirements.txt
```

Run

```bash
# Option A: run the module (main.py starts uvicorn)
cd backend
python main.py

# Option B: run uvicorn directly
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Environment
- `MONGODB_URI` (optional): connection string for your MongoDB instance. If omitted, a local MongoDB is used.

API Endpoints

- Health
	- GET / -> health check
	- Returns JSON: `{ "status": "HEALTHY", "current_time": "..." }` ([backend/routes/health.py](backend/routes/health.py#L1)).

- Receive transaction webhook
	- POST /v1/webhooks/transactions
	- Body (JSON):
		- `transaction_id` (string)
		- `source_account` (string)
		- `destination_account` (string)
		- `amount` (number)
		- `currency` (string)
	- Response: 202 Accepted (empty body). The server will insert the transaction (if not already present) and schedule a background task to mark it processed after ~30s. See [backend/routes/transactions.py](backend/routes/transactions.py#L1).

- Fetch transaction
	- GET /v1/transactions/{transaction_id}
	- Returns the stored transaction (fields include `transaction_id`, `source_account`, `destination_account`, `amount`, `currency`, `status`, `created_at`, `processed_at`). If not found, returns 404.

Database details
- Default DB: `webhooks_db`, collection `transactions`.
- A unique index on `transaction_id` is created by `db/storage.py` to ensure idempotency.

Notes
- Background processing is implemented in `routes/tasks.py` and simply waits ~30 seconds then calls `mark_processed` in `db/storage.py`.

--

**Frontend**

- Location: `frontend/`
- Stack: Vite, React, TypeScript, Tailwind, Chart.js, Supabase client for optional persistence.

Install

```bash
cd frontend
npm install
```

Run (development)

```bash
cd frontend
npm run dev
```

Build / Preview

```bash
cd frontend
npm run build
npm run preview
```

Configuration
- The Supabase demo project and anon key are in `frontend/src/supabaseClient.ts`. Replace `SUPABASE_URL` and `SUPABASE_ANON` with your own keys for production. See [frontend/src/supabaseClient.ts](frontend/src/supabaseClient.ts#L1).

Functionality
- Dashboard title: "Call Analytics Dashboard" (see [frontend/src/App.tsx](frontend/src/App.tsx#L1)).
- Visualizations:
	- `AreaChart` (call duration over months).
	- `CallChart` (pie/segment chart for sad-path analysis).
	- `ChartControls` for editing individual slice values.
- Persistence:
	- If a Supabase table `user_values` exists and is reachable, the app will store/retrieve per-email values from Supabase.
	- If the Supabase table is missing or returns 404 the app falls back to `localStorage` (keyed by `user_values_<email>`).
	- The App displays SQL snippet and guidance to create the `user_values` table if needed.

Key files
- [frontend/src/App.tsx](frontend/src/App.tsx#L1) — main UI and save logic.
- [frontend/src/supabaseClient.ts](frontend/src/supabaseClient.ts#L1) — Supabase client config.

--

Development notes
- This project uses a minimal local MongoDB for backend persistence and a demo Supabase project for frontend persistence. To fully exercise the flow:
	1. Start MongoDB or set `MONGODB_URI` to a reachable cluster.
	2. Run the backend (see commands above).
	3. Start the frontend (`npm run dev`) and open the Vite URL (usually `http://localhost:5173`).

Testing the webhook flow
1. POST a JSON payload to `http://localhost:8000/v1/webhooks/transactions` with the required fields. Example:

```bash
curl -X POST http://localhost:8000/v1/webhooks/transactions \
	-H "Content-Type: application/json" \
	-d '{"transaction_id":"tx123","source_account":"A","destination_account":"B","amount":12.5,"currency":"USD"}'
```

2. Immediately GET `http://localhost:8000/v1/transactions/tx123` to see the stored record (may be `PROCESSING` initially). After ~30s the background task will set `status` to `PROCESSED` and `processed_at` will be populated.

--

If you want, I can:
- Add example integration tests for the backend.
- Add a small script to POST sample webhooks.
- Update `frontend/src/supabaseClient.ts` to read from environment variables instead of hard-coded values.

File references
- Backend main: [backend/main.py](backend/main.py#L1)
- Backend routes: [backend/routes/transactions.py](backend/routes/transactions.py#L1)
- Frontend app: [frontend/src/App.tsx](frontend/src/App.tsx#L1)

