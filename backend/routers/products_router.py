from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from models import Product, Inventory
from schemas import ProductCreate, ProductUpdate, ProductResponse
from auth import get_db

router = APIRouter(prefix="/products", tags=["products"])


def _to_product_response(product: Product) -> ProductResponse:
    on_hand = sum(
        item.quantity for item in product.inventory_items) if product.inventory_items else 0.0
    free_to_use = sum(
        item.free_to_use for item in product.inventory_items) if product.inventory_items else 0.0
    total_value = round(on_hand * product.per_unit_cost, 2)

    return ProductResponse(
        id=product.id,
        sku=product.sku,
        name=product.name,
        category=product.category or "General",
        unit_of_measure=product.unit_of_measure,
        per_unit_cost=product.per_unit_cost,
        reorder_level=product.reorder_level,
        avg_daily_usage=product.avg_daily_usage,
        lead_time_days=product.lead_time_days,
        is_active=product.is_active,
        on_hand=on_hand,
        free_to_use=free_to_use,
        total_value=total_value,
        created_at=product.created_at,
    )


@router.get("", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Product.name.ilike(s)) | (Product.sku.ilike(s)))
    if category and category != "All":
        query = query.filter(Product.category == category)

    products = query.order_by(Product.name.asc()).all()
    return [_to_product_response(p) for p in products]


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(
        Product.sku == payload.sku.strip()).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Product with SKU '{payload.sku}' already exists."
        )

    product = Product(
        sku=payload.sku.strip(),
        name=payload.name.strip(),
        category=payload.category.strip() if payload.category else "General",
        unit_of_measure=payload.unit_of_measure.strip() or "unit",
        per_unit_cost=payload.per_unit_cost,
        reorder_level=payload.reorder_level,
        avg_daily_usage=payload.avg_daily_usage,
        lead_time_days=payload.lead_time_days,
        is_active=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_product_response(product)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _to_product_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.name is not None:
        product.name = payload.name.strip()
    if payload.category is not None:
        product.category = payload.category.strip()
    if payload.unit_of_measure is not None:
        product.unit_of_measure = payload.unit_of_measure.strip()
    if payload.per_unit_cost is not None:
        product.per_unit_cost = payload.per_unit_cost
    if payload.reorder_level is not None:
        product.reorder_level = payload.reorder_level
    if payload.avg_daily_usage is not None:
        product.avg_daily_usage = payload.avg_daily_usage
    if payload.lead_time_days is not None:
        product.lead_time_days = payload.lead_time_days
    if payload.is_active is not None:
        product.is_active = payload.is_active

    db.commit()
    db.refresh(product)
    return _to_product_response(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Soft delete
    product.is_active = False
    db.commit()
    return None
