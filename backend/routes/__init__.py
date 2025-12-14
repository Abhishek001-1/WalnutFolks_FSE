"""API routes package."""

from fastapi import APIRouter

from .health import router as health_router
from .transactions import router as transactions_router

router = APIRouter()
router.include_router(health_router)
router.include_router(transactions_router)

__all__ = ["router", "health_router", "transactions_router"]
