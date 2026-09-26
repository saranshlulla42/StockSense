from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from models import (
    Operation, OperationLine, Warehouse, Location, Product, Inventory,
    get_next_reference, apply_stock_change
)
from schemas import (
    OperationCreate, OperationResponse, OperationLineResponse, OperationLineCreate
)
from auth import get_db, get_current_user

router = APIRouter(prefix="/operations", tags=["operations"])


def _to_operation_response(op: Operation) -> OperationResponse:
    lines_resp = []
    for l in op.lines:
        lines_resp.append(OperationLineResponse(
            id=l.id,
            operation_id=l.operation_id,
            product_id=l.product_id,
            product_sku=l.product.sku if l.product else None,
            product_name=l.product.name if l.product else None,
            unit_of_measure=l.product.unit_of_measure if l.product else "unit",
            quantity=l.quantity,
            counted_quantity=l.counted_quantity,
            is_out_of_stock=l.is_out_of_stock,
        ))

    return OperationResponse(
        id=op.id,
        reference=op.reference,
        type=op.type,
        status=op.status,
        contact_name=op.contact_name,
        schedule_date=op.schedule_date,
        warehouse_id=op.warehouse_id,
        warehouse_name=op.warehouse.name if op.warehouse else None,
        responsible_id=op.responsible_id,
        responsible_name=op.responsible.full_name if op.responsible else None,
        source_location_id=op.source_location_id,
        source_location_name=op.source_location.name if op.source_location else None,
        destination_location_id=op.destination_location_id,
        destination_location_name=op.destination_location.name if op.destination_location else None,
        delivery_address=op.delivery_address,
        adjustment_reason=op.adjustment_reason,
        created_at=op.created_at,
        updated_at=op.updated_at,
        validated_at=op.validated_at,
        lines=lines_resp,
    )


@router.get("", response_model=List[OperationResponse])
def list_operations(
    type: Optional[str] = Query(
        None, description="receipt | delivery | transfer | adjustment"),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Operation)
    if type:
        query = query.filter(Operation.type == type)
    if status and status != "All":
        query = query.filter(Operation.status == status)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Operation.reference.ilike(s)) | (Operation.contact_name.ilike(s))
        )

    ops = query.order_by(Operation.created_at.desc()).all()
    return [_to_operation_response(op) for op in ops]


@router.post("", response_model=OperationResponse, status_code=status.HTTP_201_CREATED)
def create_operation(payload: OperationCreate, db: Session = Depends(get_db)):
    # 1. Determine reference prefix
    wh = db.query(Warehouse).filter(
        Warehouse.id == payload.warehouse_id).first() if payload.warehouse_id else None
    wh_code = wh.short_code if wh else "WH"

    if payload.type == "receipt":
        prefix = f"{wh_code}/IN"
    elif payload.type == "delivery":
        prefix = f"{wh_code}/OUT"
    elif payload.type == "transfer":
        prefix = f"{wh_code}/TRANSFER"
    elif payload.type == "adjustment":
        prefix = f"{wh_code}/ADJ"
    else:
        prefix = f"{wh_code}/OP"

    ref = get_next_reference(db, prefix)

    # 2. Check stock availability for deliveries
    initial_status = "ready"
    if payload.type == "delivery" and payload.source_location_id:
        for line in payload.lines:
            inv = db.query(Inventory).filter_by(
                product_id=line.product_id,
                location_id=payload.source_location_id
            ).first()
            avail = inv.free_to_use if inv else 0.0
            if avail < line.quantity:
                initial_status = "waiting"
                break

    # 3. Create Operation
    op = Operation(
        reference=ref,
        type=payload.type,
        status=initial_status,
        contact_name=payload.contact_name or "",
        schedule_date=payload.schedule_date or date.today(),
        warehouse_id=payload.warehouse_id,
        source_location_id=payload.source_location_id,
        destination_location_id=payload.destination_location_id,
        delivery_address=payload.delivery_address,
        adjustment_reason=payload.adjustment_reason,
    )
    db.add(op)
    db.flush()

    # 4. Create Lines
    for line in payload.lines:
        is_oos = False
        if payload.type == "delivery" and payload.source_location_id:
            inv = db.query(Inventory).filter_by(
                product_id=line.product_id,
                location_id=payload.source_location_id
            ).first()
            if not inv or inv.free_to_use < line.quantity:
                is_oos = True

        op_line = OperationLine(
            operation_id=op.id,
            product_id=line.product_id,
            quantity=line.quantity,
            counted_quantity=line.counted_quantity,
            is_out_of_stock=is_oos,
        )
        db.add(op_line)

    db.commit()
    db.refresh(op)
    return _to_operation_response(op)


@router.get("/{operation_id}", response_model=OperationResponse)
def get_operation(operation_id: int, db: Session = Depends(get_db)):
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found.")
    return _to_operation_response(op)


@router.post("/{operation_id}/validate", response_model=OperationResponse)
def validate_operation(operation_id: int, db: Session = Depends(get_db)):
    """
    Validates and completes the operation, applying physical stock changes
    and generating immutable ledger entries in move_history.
    """
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found.")

    if op.status == "done":
        raise HTTPException(
            status_code=400, detail="Operation is already completed.")
    if op.status == "cancelled":
        raise HTTPException(
            status_code=400, detail="Cannot validate a cancelled operation.")

    try:
        if op.type == "receipt":
            loc_id = op.destination_location_id
            if not loc_id:
                raise HTTPException(
                    status_code=400, detail="Destination location is required for receipts.")
            for line in op.lines:
                apply_stock_change(
                    session=db,
                    product_id=line.product_id,
                    location_id=loc_id,
                    delta=line.quantity,
                    operation_id=op.id,
                    reference=op.reference,
                    move_type="in",
                    to_location_id=loc_id,
                    operation_line_id=line.id,
                    contact_name=op.contact_name,
                )

        elif op.type == "delivery":
            loc_id = op.source_location_id
            if not loc_id:
                raise HTTPException(
                    status_code=400, detail="Source location is required for deliveries.")
            for line in op.lines:
                apply_stock_change(
                    session=db,
                    product_id=line.product_id,
                    location_id=loc_id,
                    delta=-line.quantity,
                    operation_id=op.id,
                    reference=op.reference,
                    move_type="out",
                    from_location_id=loc_id,
                    operation_line_id=line.id,
                    contact_name=op.contact_name,
                )

        elif op.type == "transfer":
            src_loc_id = op.source_location_id
            dst_loc_id = op.destination_location_id
            if not src_loc_id or not dst_loc_id:
                raise HTTPException(
                    status_code=400, detail="Both source and destination locations are required for transfers.")
            for line in op.lines:
                # Deduct from source
                apply_stock_change(
                    session=db,
                    product_id=line.product_id,
                    location_id=src_loc_id,
                    delta=-line.quantity,
                    operation_id=op.id,
                    reference=op.reference,
                    move_type="transfer",
                    from_location_id=src_loc_id,
                    to_location_id=dst_loc_id,
                    operation_line_id=line.id,
                )
                # Add to destination
                apply_stock_change(
                    session=db,
                    product_id=line.product_id,
                    location_id=dst_loc_id,
                    delta=line.quantity,
                    operation_id=op.id,
                    reference=op.reference,
                    move_type="transfer",
                    from_location_id=src_loc_id,
                    to_location_id=dst_loc_id,
                    operation_line_id=line.id,
                )

        elif op.type == "adjustment":
            loc_id = op.source_location_id
            if not loc_id:
                raise HTTPException(
                    status_code=400, detail="Location is required for adjustments.")
            for line in op.lines:
                inv = db.query(Inventory).filter_by(
                    product_id=line.product_id,
                    location_id=loc_id
                ).first()
                current_qty = inv.quantity if inv else 0.0
                counted = line.counted_quantity if line.counted_quantity is not None else line.quantity
                delta = counted - current_qty

                if delta != 0:
                    apply_stock_change(
                        session=db,
                        product_id=line.product_id,
                        location_id=loc_id,
                        delta=delta,
                        operation_id=op.id,
                        reference=op.reference,
                        move_type="adjustment",
                        from_location_id=loc_id,
                        operation_line_id=line.id,
                        reason=op.adjustment_reason or "Stock adjustment",
                    )

        op.status = "done"
        op.validated_at = datetime.utcnow()
        db.commit()
        db.refresh(op)
        return _to_operation_response(op)

    except ValueError as err:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(err))


@router.post("/{operation_id}/cancel", response_model=OperationResponse)
def cancel_operation(operation_id: int, db: Session = Depends(get_db)):
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found.")
    if op.status == "done":
        raise HTTPException(
            status_code=400, detail="Cannot cancel an already completed operation.")

    op.status = "cancelled"
    db.commit()
    db.refresh(op)
    return _to_operation_response(op)
