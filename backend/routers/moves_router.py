from fastapi import APIRouter

router = APIRouter(prefix="/moves", tags=["moves"])


@router.get("")
def list_moves() -> list[dict[str, object]]:
    return []
