from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import Product, Inventory, Operation, MoveHistory
from schemas import (
    DashboardKpis, DashboardActivity, DashboardChartData, DashboardData
)
from auth import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=DashboardKpis)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).all()

    total_skus = len(products)
    total_val = 0.0
    low_stock = 0
    out_of_stock = 0

    for p in products:
        qty = sum(
            item.quantity for item in p.inventory_items) if p.inventory_items else 0.0
        total_val += qty * p.per_unit_cost
        if qty == 0:
            out_of_stock += 1
        elif qty <= p.reorder_level:
            low_stock += 1

    pending_rcpts = db.query(Operation).filter(
        Operation.type == "receipt",
        Operation.status.in_(["draft", "waiting", "ready"])
    ).count()

    pending_dels = db.query(Operation).filter(
        Operation.type == "delivery",
        Operation.status.in_(["draft", "waiting", "ready"])
    ).count()

    completed_ops = db.query(Operation).filter(
        Operation.status == "done").count()

    return DashboardKpis(
        total_skus=total_skus,
        total_stock_value=round(total_val, 2),
        low_stock_count=low_stock,
        out_of_stock_count=out_of_stock,
        pending_receipts=pending_rcpts,
        pending_deliveries=pending_dels,
        completed_operations=completed_ops,
    )


@router.get("/data", response_model=DashboardData)
def get_dashboard_full_data(db: Session = Depends(get_db)):
    kpis = get_dashboard_kpis(db)

    # Recent activity
    recent_ops = db.query(Operation).order_by(
        Operation.updated_at.desc()).limit(8).all()
    activities = []
    for op in recent_ops:
        desc = f"{op.type.capitalize()} {op.reference} ({op.status})"
        if op.contact_name:
            desc += f" · {op.contact_name}"
        activities.append(DashboardActivity(
            id=op.id,
            reference=op.reference,
            type=op.type,
            status=op.status,
            contact_name=op.contact_name,
            date=op.updated_at,
            description=desc,
        ))

    # 7-day movement chart
    chart_points = []
    today = date.today()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_start = datetime.combine(d, datetime.min.time())
        day_end = datetime.combine(d, datetime.max.time())

        in_qty = db.query(func.sum(MoveHistory.quantity)).filter(
            MoveHistory.move_type == "in",
            MoveHistory.date >= day_start,
            MoveHistory.date <= day_end
        ).scalar() or 0.0

        out_qty = db.query(func.sum(MoveHistory.quantity)).filter(
            MoveHistory.move_type == "out",
            MoveHistory.date >= day_start,
            MoveHistory.date <= day_end
        ).scalar() or 0.0

        chart_points.append(DashboardChartData(
            label=d.strftime("%a"),
            inbound=float(in_qty),
            outbound=float(out_qty),
        ))

    return DashboardData(
        kpis=kpis,
        recent_activity=activities,
        chart_data=chart_points,
    )
