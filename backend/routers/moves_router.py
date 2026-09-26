from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from models import MoveHistory, Product, Location
from schemas import MoveHistoryResponse
from auth import get_db

router = APIRouter(prefix="", tags=["moves"])


@router.get("/moves", response_model=List[MoveHistoryResponse])
@router.get("/stock-moves", response_model=List[MoveHistoryResponse])
def list_moves(
    move_type: Optional[str] = None,
    product_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MoveHistory).join(Product)

    if move_type and move_type != "All":
        query = query.filter(MoveHistory.move_type == move_type)
    if product_id:
        query = query.filter(MoveHistory.product_id == product_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (MoveHistory.reference.ilike(s)) |
            (Product.name.ilike(s)) |
            (Product.sku.ilike(s)) |
            (MoveHistory.contact_name.ilike(s))
        )

    moves = query.order_by(MoveHistory.date.desc()).limit(100).all()

    resp = []
    for m in moves:
        resp.append(MoveHistoryResponse(
            id=m.id,
            reference=m.reference,
            move_type=m.move_type,
            product_id=m.product_id,
            product_sku=m.product.sku if m.product else None,
            product_name=m.product.name if m.product else None,
            quantity=m.quantity,
            from_location_id=m.from_location_id,
            from_location_name=m.from_location.name if m.from_location else None,
            to_location_id=m.to_location_id,
            to_location_name=m.to_location.name if m.to_location else None,
            contact_name=m.contact_name,
            reason=m.reason,
            date=m.date,
        ))

    return resp
