from fastapi import APIRouter

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("")
def get_inventory() -> list[dict[str, object]]:
    return []
