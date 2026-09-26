from dataclasses import dataclass
from datetime import datetime


@dataclass
class Product:
    name: str
    sku: str
    category: str = ""
    unit_of_measure: str = "units"
    per_unit_cost: float = 0.0
    on_hand: int = 0
    free_to_use: int = 0


@dataclass
class Operation:
    reference: str
    operation_type: str
    status: str = "draft"
    contact_name: str = ""
    schedule_date: datetime | None = None
