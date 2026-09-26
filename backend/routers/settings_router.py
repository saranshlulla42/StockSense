from fastapi import APIRouter

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings() -> dict[str, list[object]]:
    return {"warehouses": [], "locations": []}
