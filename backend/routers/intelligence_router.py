from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from models import Product, Inventory, Operation, MoveHistory, Warehouse
from schemas import (
    InventoryHealthData, HealthCategoryItem, SmartReorderSuggestion, ActionItem
)
from auth import get_db

router = APIRouter(prefix="", tags=["intelligence"])


@router.get("/analytics/inventory-health", response_model=InventoryHealthData)
@router.get("/intelligence/inventory-health", response_model=InventoryHealthData)
def get_inventory_health(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).all()

    optimal = 0
    low_stock = 0
    out_of_stock = 0
    overstocked = 0
    total_val = 0.0

    items = []
    for p in products:
        current_stock = sum(
            item.quantity for item in p.inventory_items) if p.inventory_items else 0.0
        val = current_stock * p.per_unit_cost
        total_val += val

        daily_usage = p.avg_daily_usage or 1.0
        days_of_stock = round(current_stock / daily_usage,
                              1) if daily_usage > 0 else 999.0

        if current_stock == 0:
            status = "out_of_stock"
            out_of_stock += 1
        elif current_stock <= p.reorder_level:
            status = "low_stock"
            low_stock += 1
        elif days_of_stock > 60:
            status = "overstocked"
            overstocked += 1
        else:
            status = "optimal"
            optimal += 1

        items.append(HealthCategoryItem(
            product_id=p.id,
            sku=p.sku,
            name=p.name,
            category=p.category or "General",
            current_stock=current_stock,
            reorder_level=p.reorder_level,
            avg_daily_usage=p.avg_daily_usage,
            days_of_stock=days_of_stock,
            stock_value=round(val, 2),
            health_status=status,
        ))

    total_prods = max(1, len(products))
    # Health score algorithm: 100 - (out_of_stock * 25 / total) - (low_stock * 15 / total)
    penalty = (out_of_stock * 35.0 / total_prods) + \
        (low_stock * 20.0 / total_prods)
    health_score = max(0, min(100, int(100 - penalty)))

    return InventoryHealthData(
        health_score=health_score,
        optimal_count=optimal,
        low_stock_count=low_stock,
        out_of_stock_count=out_of_stock,
        overstocked_count=overstocked,
        total_inventory_value=round(total_val, 2),
        items=items,
    )


@router.get("/reorder/suggestions", response_model=List[SmartReorderSuggestion])
@router.get("/intelligence/smart-reorder", response_model=List[SmartReorderSuggestion])
def get_reorder_suggestions(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).all()

    suggestions = []
    for p in products:
        current_stock = sum(
            item.quantity for item in p.inventory_items) if p.inventory_items else 0.0
        daily_usage = p.avg_daily_usage or 1.0
        lead_time = p.lead_time_days or 3
        days_until_stockout = round(
            current_stock / daily_usage, 1) if daily_usage > 0 else 99.0

        # Triggers when current stock <= reorder level or days of stock <= lead time + 2
        is_triggered = current_stock <= p.reorder_level or days_until_stockout <= (
            lead_time + 2)

        if is_triggered:
            # Formula: (Daily Usage * (Lead Time + 10 Buffer Days)) - Current Stock
            target_stock = daily_usage * (lead_time + 10)
            suggested_qty = max(10.0, round(target_stock - current_stock, 0))
            cost = round(suggested_qty * p.per_unit_cost, 2)

            if current_stock == 0 or days_until_stockout <= lead_time:
                urgency = "critical"
            elif days_until_stockout <= (lead_time + 2):
                urgency = "high"
            else:
                urgency = "medium"

            suggestions.append(SmartReorderSuggestion(
                product_id=p.id,
                sku=p.sku,
                name=p.name,
                category=p.category or "General",
                current_stock=current_stock,
                reorder_level=p.reorder_level,
                avg_daily_usage=p.avg_daily_usage,
                lead_time_days=p.lead_time_days,
                days_until_stockout=days_until_stockout,
                suggested_order_qty=suggested_qty,
                estimated_cost=cost,
                urgency=urgency,
            ))

    # Sort critical first
    urgency_order = {"critical": 0, "high": 1, "medium": 2}
    suggestions.sort(key=lambda s: urgency_order.get(s.urgency, 3))
    return suggestions


@router.get("/actions/pending", response_model=List[ActionItem])
@router.get("/intelligence/action-center", response_model=List[ActionItem])
def get_pending_actions(db: Session = Depends(get_db)):
    actions = []

    # 1. Late deliveries or waiting deliveries
    waiting_dels = db.query(Operation).filter(
        Operation.type == "delivery",
        Operation.status.in_(["waiting", "ready"]),
        Operation.schedule_date < date.today()
    ).all()
    for deliv in waiting_dels:
        actions.append(ActionItem(
            id=f"del-late-{deliv.id}",
            title=f"Overdue Delivery: {deliv.reference}",
            description=f"Delivery to {deliv.contact_name or 'customer'} was scheduled for {deliv.schedule_date}.",
            urgency="critical",
            type="late_delivery",
            action_label="Review Delivery",
            route_target="/deliveries",
            created_at=deliv.created_at,
        ))

    # 2. Out of stock operations
    oos_ops = db.query(Operation).filter(
        Operation.status == "waiting"
    ).all()
    for op in oos_ops:
        if not any(a.id == f"del-late-{op.id}" for a in actions):
            actions.append(ActionItem(
                id=f"op-waiting-{op.id}",
                title=f"Blocked Operation: {op.reference}",
                description=f"Operation is waiting due to insufficient stock in warehouse.",
                urgency="warning",
                type="stockout",
                action_label="View Operation",
                route_target="/deliveries" if op.type == "delivery" else "/transfers",
                created_at=op.created_at,
            ))

    # 3. Critical stockouts
    products = db.query(Product).filter(Product.is_active == True).all()
    for p in products:
        qty = sum(
            item.quantity for item in p.inventory_items) if p.inventory_items else 0.0
        if qty == 0:
            actions.append(ActionItem(
                id=f"stockout-{p.id}",
                title=f"Stockout Alert: {p.name} ({p.sku})",
                description="Zero stock on hand across all locations. Immediate reorder recommended.",
                urgency="critical",
                type="stockout",
                action_label="Reorder Stock",
                route_target="/smart-reorder",
                created_at=p.created_at,
            ))
        elif qty <= p.reorder_level:
            actions.append(ActionItem(
                id=f"low-stock-{p.id}",
                title=f"Low Stock: {p.name} ({p.sku})",
                description=f"Current stock ({qty}) is at or below reorder threshold ({p.reorder_level}).",
                urgency="warning",
                type="low_stock",
                action_label="Check Reorder",
                route_target="/smart-reorder",
                created_at=p.created_at,
            ))

    # 4. Ready receipts awaiting intake
    ready_rcpts = db.query(Operation).filter(
        Operation.type == "receipt",
        Operation.status == "ready"
    ).all()
    for r in ready_rcpts:
        actions.append(ActionItem(
            id=f"rcpt-ready-{r.id}",
            title=f"Incoming Intake Ready: {r.reference}",
            description=f"Shipment from {r.contact_name or 'vendor'} is ready to be validated and stored.",
            urgency="info",
            type="pending_validation",
            action_label="Validate Intake",
            route_target="/receipts",
            created_at=r.created_at,
        ))

    return actions
