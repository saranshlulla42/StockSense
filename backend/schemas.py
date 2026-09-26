from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    status: str


class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    sku: str = Field(min_length=1)
    category: str = ""
    unit_of_measure: str = "units"
    per_unit_cost: float = Field(default=0, ge=0)


class ProductResponse(ProductCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    on_hand: int = 0
    free_to_use: int = 0


class OperationCreate(BaseModel):
    operation_type: str
    contact_name: str = ""
    schedule_date: date | None = None


class OperationResponse(OperationCreate):
    id: int
    reference: str
    status: str
