from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard() -> dict[str, int]:
    return {"receipts": 0, "deliveries": 0, "late": 0}
