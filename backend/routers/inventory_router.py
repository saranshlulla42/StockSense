from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from models import Inventory, Location, Warehouse, Product
from schemas import LocationStockGroup, StockItem
from auth import get_db

router = APIRouter(prefix="", tags=["inventory"])


@router.get("/stock/by-location", response_model=List[LocationStockGroup])
def get_stock_by_location(
    warehouse_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns inventory grouped by warehouse and location.
    """
    loc_query = db.query(Location).join(Warehouse).filter(
        Location.is_active == True,
        Warehouse.is_active == True
    )

    if warehouse_id:
        loc_query = loc_query.filter(Location.warehouse_id == warehouse_id)

    locations = loc_query.order_by(
        Warehouse.name.asc(), Location.name.asc()).all()

    result = []
    for loc in locations:
        inv_query = db.query(Inventory).join(Product).filter(
            Inventory.location_id == loc.id,
            Product.is_active == True,
            Inventory.quantity > 0
        )

        if search:
            s = f"%{search.strip()}%"
            inv_query = inv_query.filter(
                (Product.name.ilike(s)) | (Product.sku.ilike(s)) | (
                    Product.category.ilike(s))
            )

        inv_rows = inv_query.all()

        items = []
        total_val = 0.0
        for row in inv_rows:
            p = row.product
            val = round(row.quantity * p.per_unit_cost, 2)
            total_val += val
            items.append(StockItem(
                product_id=p.id,
                sku=p.sku,
                product_name=p.name,
                category=p.category or "General",
                unit_of_measure=p.unit_of_measure,
                per_unit_cost=p.per_unit_cost,
                quantity=row.quantity,
                reserved_quantity=row.reserved_quantity,
                free_to_use=row.free_to_use,
                total_value=val,
            ))

        # Always include the location if search wasn't specific or if items match
        if not search or len(items) > 0:
            result.append(LocationStockGroup(
                location_id=loc.id,
                location_name=loc.name,
                location_code=loc.short_code,
                warehouse_id=loc.warehouse.id,
                warehouse_name=loc.warehouse.name,
                warehouse_code=loc.warehouse.short_code,
                total_items_count=len(items),
                total_stock_value=round(total_val, 2),
                items=items,
            ))

    return result
