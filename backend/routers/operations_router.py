from fastapi import APIRouter

from backend.schemas import OperationCreate, OperationResponse

router = APIRouter(prefix="/operations", tags=["operations"])


@router.get("", response_model=list[OperationResponse])
def list_operations() -> list[OperationResponse]:
    return []


@router.post("", response_model=OperationResponse)
def create_operation(operation: OperationCreate) -> OperationResponse:
    return OperationResponse(id=1, reference="WH/NEW/0001", status="draft", **operation.model_dump())
