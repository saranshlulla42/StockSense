"""
StockSense — Demo Data Seeder.
Run: python seed.py
"""

from datetime import datetime, date, timedelta
from models import (
    Base, engine, SessionLocal, User, Warehouse, Location,
    Product, Inventory, Operation, OperationLine, ReferenceCounter,
    apply_stock_change
)
from auth import get_password_hash


def seed_database():
    print("Resetting database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        print("1. Seeding Reference Counters...")
        counters = [
            ReferenceCounter(prefix="WH/IN", next_value=3),
            ReferenceCounter(prefix="WH/OUT", next_value=3),
            ReferenceCounter(prefix="WH/TRANSFER", next_value=2),
            ReferenceCounter(prefix="WH/ADJ", next_value=2),
            ReferenceCounter(prefix="WH2/IN", next_value=1),
            ReferenceCounter(prefix="WH2/OUT", next_value=1),
        ]
        session.add_all(counters)

        print("2. Seeding Users...")
        manager = User(
            login_id="manager1",
            email="manager@stocksense.io",
            password_hash=get_password_hash("Admin@123"),
            full_name="Alex Rivera",
            role="inventory_manager"
        )
        staff = User(
            login_id="staff01",
            email="staff@stocksense.io",
            password_hash=get_password_hash("Staff@123"),
            full_name="Sam Miller",
            role="warehouse_staff"
        )
        session.add_all([manager, staff])
        session.flush()

        print("3. Seeding Warehouses & Locations...")
        wh1 = Warehouse(name="Main Hub", short_code="WH",
                        address="100 Logistics Blvd, Chicago IL")
        wh2 = Warehouse(name="North Depot", short_code="WH2",
                        address="45 Industrial Way, Milwaukee WI")
        session.add_all([wh1, wh2])
        session.flush()

        loc_wh_stock = Location(warehouse_id=wh1.id,
                                name="General Stock", short_code="Stock")
        loc_wh_rack_a = Location(
            warehouse_id=wh1.id, name="Rack A - High Bay", short_code="RackA")
        loc_wh_prod = Location(warehouse_id=wh1.id,
                               name="Production Floor", short_code="Prod")
        loc_wh2_stock = Location(
            warehouse_id=wh2.id, name="Secondary Storage", short_code="Stock")
        loc_wh2_bay1 = Location(warehouse_id=wh2.id,
                                name="Bay 1", short_code="Bay1")

        session.add_all([loc_wh_stock, loc_wh_rack_a,
                        loc_wh_prod, loc_wh2_stock, loc_wh2_bay1])
        session.flush()

        print("4. Seeding Products...")
        # Varied products for testing Smart Reorder, Stockout Risk & Smart Transfer
        p_steel = Product(
            sku="RAW-STL-001", name="Steel Rods 10mm", category="Raw Materials",
            unit_of_measure="m", per_unit_cost=15.50, reorder_level=50.0,
            avg_daily_usage=12.0, lead_time_days=4
        )
        p_motor = Product(
            sku="ELEC-MOT-500", name="Servo Motor 500W", category="Electronics",
            unit_of_measure="unit", per_unit_cost=120.00, reorder_level=30.0,
            avg_daily_usage=5.0, lead_time_days=7
        )
        p_fasteners = Product(
            sku="FAST-HEX-M8", name="M8 Hex Bolts (Box 100)", category="Fasteners",
            unit_of_measure="box", per_unit_cost=8.75, reorder_level=20.0,
            avg_daily_usage=2.0, lead_time_days=3
        )
        p_sensor = Product(
            sku="ELEC-SNS-PROX", name="Proximity Sensor V2", category="Electronics",
            unit_of_measure="unit", per_unit_cost=45.00, reorder_level=40.0,
            avg_daily_usage=8.0, lead_time_days=5
        )

        session.add_all([p_steel, p_motor, p_fasteners, p_sensor])
        session.flush()

        print("5. Initializing Stock & Move Histories...")
        # Initial Stock Setup (via apply_stock_change helper)
        # Steel Rods: Surplus in WH (140), Shortage in WH2 (10) -> Triggers Smart Transfer!
        apply_stock_change(session, p_steel.id, loc_wh_stock.id, 140.0, None,
                           "INIT/0001", "in", to_location_id=loc_wh_stock.id, reason="Initial setup")
        apply_stock_change(session, p_steel.id, loc_wh2_stock.id, 10.0, None,
                           "INIT/0002", "in", to_location_id=loc_wh2_stock.id, reason="Initial setup")

        # Servo Motor: Critical stock (only 8 left vs reorder level 30) -> Triggers Smart Reorder & Stockout warning!
        apply_stock_change(session, p_motor.id, loc_wh_stock.id, 8.0, None, "INIT/0003",
                           "in", to_location_id=loc_wh_stock.id, reason="Initial setup")

        # Fasteners: Healthy stock (100 in stock vs reorder level 20)
        apply_stock_change(session, p_fasteners.id, loc_wh_stock.id, 100.0, None,
                           "INIT/0004", "in", to_location_id=loc_wh_stock.id, reason="Initial setup")

        # Sensor: Watch stock (35 in stock vs reorder level 40)
        apply_stock_change(session, p_sensor.id, loc_wh_stock.id, 35.0, None,
                           "INIT/0005", "in", to_location_id=loc_wh_stock.id, reason="Initial setup")

        print("6. Seeding Operations (Receipts, Deliveries, Transfers, Adjustments)...")
        # 1. Done Receipt
        op_rcpt_done = Operation(
            reference="WH/IN/0001", type="receipt", status="done",
            contact_name="Apex Steel Suppliers", schedule_date=date.today() - timedelta(days=2),
            warehouse_id=wh1.id, responsible_id=manager.id, destination_location_id=loc_wh_stock.id,
            validated_at=datetime.utcnow() - timedelta(days=2)
        )
        session.add(op_rcpt_done)
        session.flush()

        # 2. Ready Receipt (Pending / To Receive)
        op_rcpt_ready = Operation(
            reference="WH/IN/0002", type="receipt", status="ready",
            contact_name="MicroTech Components", schedule_date=date.today() + timedelta(days=1),
            warehouse_id=wh1.id, responsible_id=manager.id, destination_location_id=loc_wh_rack_a.id
        )
        line_rcpt = OperationLine(
            operation_id=op_rcpt_ready.id, product_id=p_sensor.id, quantity=50.0)
        op_rcpt_ready.lines.append(line_rcpt)
        session.add(op_rcpt_ready)

        # 3. Waiting Delivery (Late + Out of Stock)
        op_del_waiting = Operation(
            reference="WH/OUT/0001", type="delivery", status="waiting",
            contact_name="Acme Automation Ltd", schedule_date=date.today() - timedelta(days=1),  # Late!
            warehouse_id=wh1.id, responsible_id=staff.id, source_location_id=loc_wh_stock.id,
            delivery_address="742 Evergreen Terrace, Springfield"
        )
        line_del1 = OperationLine(operation_id=op_del_waiting.id,
                                  product_id=p_motor.id, quantity=15.0, is_out_of_stock=True)
        op_del_waiting.lines.append(line_del1)
        session.add(op_del_waiting)

        # 4. Ready Delivery
        op_del_ready = Operation(
            reference="WH/OUT/0002", type="delivery", status="ready",
            contact_name="BuildCorp Systems", schedule_date=date.today(),
            warehouse_id=wh1.id, responsible_id=manager.id, source_location_id=loc_wh_stock.id,
            delivery_address="88 Builder Ave, Chicago IL"
        )
        line_del2 = OperationLine(operation_id=op_del_ready.id,
                                  product_id=p_fasteners.id, quantity=10.0, is_out_of_stock=False)
        op_del_ready.lines.append(line_del2)
        session.add(op_del_ready)

        # 5. Completed Internal Transfer
        op_trans = Operation(
            reference="WH/TRANSFER/0001", type="transfer", status="done",
            contact_name="Internal Move", schedule_date=date.today() - timedelta(days=1),
            warehouse_id=wh1.id, responsible_id=staff.id,
            source_location_id=loc_wh_stock.id, destination_location_id=loc_wh_prod.id,
            validated_at=datetime.utcnow() - timedelta(days=1)
        )
        session.add(op_trans)
        session.flush()

        # Execute transfer stock mutation
        apply_stock_change(session, p_fasteners.id, loc_wh_stock.id, -20.0, op_trans.id, op_trans.reference,
                           "transfer", from_location_id=loc_wh_stock.id, to_location_id=loc_wh_prod.id)
        apply_stock_change(session, p_fasteners.id, loc_wh_prod.id, 20.0, op_trans.id, op_trans.reference,
                           "transfer", from_location_id=loc_wh_stock.id, to_location_id=loc_wh_prod.id)

        # 6. Completed Stock Adjustment
        op_adj = Operation(
            reference="WH/ADJ/0001", type="adjustment", status="done",
            contact_name="Physical Audit", schedule_date=date.today() - timedelta(days=3),
            warehouse_id=wh1.id, responsible_id=manager.id, source_location_id=loc_wh_stock.id,
            adjustment_reason="Damaged goods written off during cycle count",
            validated_at=datetime.utcnow() - timedelta(days=3)
        )
        session.add(op_adj)
        session.flush()

        apply_stock_change(session, p_sensor.id, loc_wh_stock.id, -5.0, op_adj.id, op_adj.reference,
                           "adjustment", from_location_id=loc_wh_stock.id, reason=op_adj.adjustment_reason)

        session.commit()
        print("Database seeded successfully with users, products, intelligence triggers, and operations!")

    except Exception as e:
        session.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
