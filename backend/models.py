"""
StockSense — SQLAlchemy Models & Core Inventory Utilities.

Compatible with SQLite (local dev) and PostgreSQL (Supabase / Cloud SQL).
"""

import os
from pathlib import Path
from datetime import datetime, date
from typing import Optional
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    DateTime, Date, ForeignKey, CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session
from sqlalchemy.ext.hybrid import hybrid_property

DEFAULT_DB_PATH = Path(__file__).resolve().parent / "stocksense.db"
DATABASE_URL = os.getenv(
    "DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    login_id = Column(String(50), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False, default="inventory_manager")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "role IN ('inventory_manager','warehouse_staff')", name="ck_user_role"),
    )


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    short_code = Column(String(20), nullable=False, unique=True, index=True)
    address = Column(String(255))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    locations = relationship(
        "Location", back_populates="warehouse", cascade="all, delete-orphan")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey(
        "warehouses.id", ondelete="RESTRICT"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    short_code = Column(String(20), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="locations")
    inventory_items = relationship("Inventory", back_populates="location")

    __table_args__ = (
        UniqueConstraint("warehouse_id", "short_code",
                         name="uq_location_code"),
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), index=True)
    unit_of_measure = Column(String(30), nullable=False, default="unit")
    per_unit_cost = Column(Float, nullable=False, default=0.0)
    reorder_level = Column(Float, nullable=False, default=0.0)
    # feeds Smart Reorder Engine
    avg_daily_usage = Column(Float, nullable=False, default=0.0)
    # feeds Smart Reorder Engine
    lead_time_days = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_items = relationship(
        "Inventory", back_populates="product", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("per_unit_cost >= 0", name="ck_product_cost"),
        CheckConstraint("reorder_level >= 0", name="ck_product_reorder"),
        CheckConstraint("avg_daily_usage >= 0",
                        name="ck_product_avg_daily_usage"),
        CheckConstraint("lead_time_days >= 0", name="ck_product_lead_time"),
    )

    @property
    def total_quantity(self) -> float:
        return sum(item.quantity for item in self.inventory_items)

    @property
    def total_free_to_use(self) -> float:
        return sum(item.free_to_use for item in self.inventory_items)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey(
        "products.id", ondelete="RESTRICT"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey(
        "locations.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0.0)
    reserved_quantity = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="inventory_items")
    location = relationship("Location", back_populates="inventory_items")

    __table_args__ = (
        UniqueConstraint("product_id", "location_id",
                         name="uq_inventory_product_location"),
        CheckConstraint("quantity >= 0", name="ck_inventory_qty"),
        CheckConstraint("reserved_quantity >= 0",
                        name="ck_inventory_reserved_qty"),
    )

    @hybrid_property
    def free_to_use(self) -> float:
        return max(0.0, self.quantity - self.reserved_quantity)


class Operation(Base):
    __tablename__ = "operations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reference = Column(String(50), nullable=False, unique=True, index=True)
    # receipt | delivery | transfer | adjustment
    type = Column(String(20), nullable=False, index=True)
    # draft | waiting | ready | done | cancelled
    status = Column(String(20), nullable=False, default="draft", index=True)
    contact_name = Column(String(150))
    schedule_date = Column(Date, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), index=True)
    responsible_id = Column(Integer, ForeignKey("users.id"), index=True)
    source_location_id = Column(
        Integer, ForeignKey("locations.id"), index=True)
    destination_location_id = Column(
        Integer, ForeignKey("locations.id"), index=True)
    delivery_address = Column(String(255))
    adjustment_reason = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)

    # Relationships
    warehouse = relationship("Warehouse")
    responsible = relationship("User")
    source_location = relationship(
        "Location", foreign_keys=[source_location_id])
    destination_location = relationship(
        "Location", foreign_keys=[destination_location_id])
    lines = relationship(
        "OperationLine", back_populates="operation", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "type IN ('receipt','delivery','transfer','adjustment')", name="ck_operation_type"),
        CheckConstraint(
            "status IN ('draft','waiting','ready','done','cancelled')", name="ck_operation_status"),
    )


class OperationLine(Base):
    __tablename__ = "operation_lines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    operation_id = Column(Integer, ForeignKey(
        "operations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey(
        "products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    counted_quantity = Column(Float, nullable=True)   # used by adjustments
    is_out_of_stock = Column(Boolean, nullable=False, default=False)

    operation = relationship("Operation", back_populates="lines")
    product = relationship("Product")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_operation_line_qty"),
    )


class MoveHistory(Base):
    __tablename__ = "move_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    operation_id = Column(Integer, ForeignKey("operations.id"), index=True)
    operation_line_id = Column(Integer, ForeignKey("operation_lines.id"))
    reference = Column(String(50), nullable=False, index=True)
    # in | out | transfer | adjustment
    move_type = Column(String(20), nullable=False)
    product_id = Column(Integer, ForeignKey(
        "products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    from_location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    to_location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    contact_name = Column(String(150))
    reason = Column(String(255))
    date = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product")
    operation = relationship("Operation")
    operation_line = relationship("OperationLine")
    from_location = relationship("Location", foreign_keys=[from_location_id])
    to_location = relationship("Location", foreign_keys=[to_location_id])

    __table_args__ = (
        CheckConstraint(
            "move_type IN ('in','out','transfer','adjustment')", name="ck_move_type"),
    )


class ReferenceCounter(Base):
    __tablename__ = "reference_counters"

    # e.g., 'WH/IN', 'WH/OUT', 'WH2/TRANSFER'
    prefix = Column(String(50), primary_key=True)
    next_value = Column(Integer, nullable=False, default=1)


# -------------------------------------------------------------------------
# Core Service Layer Helper Functions
# -------------------------------------------------------------------------

def get_next_reference(session: Session, prefix: str, pad: int = 4) -> str:
    """
    Atomically generates and increments reference IDs (e.g. WH/IN/0001).
    """
    counter = session.query(ReferenceCounter).filter_by(
        prefix=prefix).with_for_update().first()
    if counter is None:
        counter = ReferenceCounter(prefix=prefix, next_value=1)
        session.add(counter)
        session.flush()
    value = counter.next_value
    counter.next_value += 1
    return f"{prefix}/{str(value).zfill(pad)}"


def apply_stock_change(
    session: Session,
    product_id: int,
    location_id: int,
    delta: float,
    operation_id: int,
    reference: str,
    move_type: str,
    from_location_id: Optional[int] = None,
    to_location_id: Optional[int] = None,
    operation_line_id: Optional[int] = None,
    contact_name: Optional[str] = None,
    reason: Optional[str] = None
) -> Inventory:
    """
    The SINGLE point of mutation for inventory quantity in the application.
    Updates inventory and records the move_history row in the same transaction.
    """
    # 1. Upsert Inventory Record
    inv = session.query(Inventory).filter_by(
        product_id=product_id,
        location_id=location_id
    ).with_for_update().first()

    if not inv:
        if delta < 0:
            raise ValueError(
                "Cannot deduct stock from a location with 0 inventory recorded.")
        inv = Inventory(product_id=product_id,
                        location_id=location_id, quantity=0.0)
        session.add(inv)
        session.flush()

    new_quantity = inv.quantity + delta
    if new_quantity < 0:
        raise ValueError(
            f"Insufficient stock for product {product_id} at location {location_id}. Current: {inv.quantity}, Delta: {delta}")

    inv.quantity = new_quantity

    # 2. Insert Move History Ledger Row
    move = MoveHistory(
        operation_id=operation_id,
        operation_line_id=operation_line_id,
        reference=reference,
        move_type=move_type,
        product_id=product_id,
        quantity=abs(delta),
        from_location_id=from_location_id,
        to_location_id=to_location_id,
        contact_name=contact_name,
        reason=reason,
        date=datetime.utcnow()
    )
    session.add(move)
    return inv
