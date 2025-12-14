from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

router = APIRouter()


@router.get("/", response_class=JSONResponse)
def health_check():
    return {"status": "HEALTHY", "current_time": datetime.now(timezone.utc).isoformat()}
