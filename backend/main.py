from fastapi import FastAPI
import uvicorn

from .routes import router as routes_router
from .db import init_db


app = FastAPI(title="Webhook Transactions Service")
app.include_router(routes_router)


@app.on_event("startup")
def startup_event():
    init_db()


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, log_level="info")
