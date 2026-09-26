from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models import Warehouse, Location, Inventory
from schemas import WarehouseCreate, WarehouseResponse, LocationCreate, LocationResponse
from auth import get_db

router = APIRouter(prefix="", tags=["settings"])


@router.get("/warehouses", response_model=List[WarehouseResponse])
def list_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).filter(
        Warehouse.is_active == True).order_by(Warehouse.name.asc()).all()
    return warehouses


@router.post("/warehouses", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db)):
    existing = db.query(Warehouse).filter(
        Warehouse.short_code == payload.short_code.strip().upper()).first()
    if existing:
        raise HTTPException(
            status_code=400, detail=f"Warehouse code '{payload.short_code}' already exists.")

    warehouse = Warehouse(
        name=payload.name.strip(),
        short_code=payload.short_code.strip().upper(),
        address=payload.address.strip() if payload.address else "",
        is_active=True,
    )
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    # Auto-create default "Stock" location for convenience
    default_loc = Location(
        warehouse_id=warehouse.id,
        name="General Stock",
        short_code="Stock",
        is_active=True,
    )
    db.add(default_loc)
    db.commit()
    db.refresh(warehouse)

    return warehouse


@router.post("/warehouses/{warehouse_id}/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(warehouse_id: int, payload: LocationCreate, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(
        Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found.")

    existing = db.query(Location).filter(
        Location.warehouse_id == warehouse_id,
        Location.short_code == payload.short_code.strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail=f"Location code '{payload.short_code}' already exists in this warehouse.")

    loc = Location(
        warehouse_id=warehouse_id,
        name=payload.name.strip(),
        short_code=payload.short_code.strip(),
        is_active=True,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.get("/locations", response_model=List[LocationResponse])
def list_all_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).filter(
        Location.is_active == True).order_by(Location.name.asc()).all()
    return locations
