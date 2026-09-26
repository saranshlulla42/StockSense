from fastapi import APIRouter
from schemas import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductResponse])
def list_products() -> list[ProductResponse]:
    return []


@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate) -> ProductResponse:
    return ProductResponse(id=1, on_hand=0, free_to_use=0, **product.model_dump())
