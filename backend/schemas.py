from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class HealthResponse(BaseModel):
    status: str


# -------------------------------------------------------------------------
# Auth & User Schemas
# -------------------------------------------------------------------------

class UserBase(BaseModel):
    login_id: Optional[str] = Field(default=None, min_length=4, max_length=50)
    email: str
    full_name: str
    role: str = Field(default="inventory_manager")


class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: str
    password: str = Field(..., min_length=8)
    role: str = Field(default="inventory_manager")


class UserLogin(BaseModel):
    identifier: str = Field(..., description="The user's email address or login ID.")
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[datetime] = None


class SignupResponse(BaseModel):
    message: str
    email: str
    requires_otp: bool = True
    demo_otp: Optional[str] = None


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=6, max_length=6)


class ResendOtpRequest(BaseModel):
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# -------------------------------------------------------------------------
# Product Schemas
# -------------------------------------------------------------------------

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    category: Optional[str] = "General"
    unit_of_measure: str = "unit"
    per_unit_cost: float = Field(default=0.0, ge=0)
    reorder_level: float = Field(default=0.0, ge=0)
    avg_daily_usage: float = Field(default=0.0, ge=0)
    lead_time_days: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit_of_measure: Optional[str] = None
    per_unit_cost: Optional[float] = None
    reorder_level: Optional[float] = None
    avg_daily_usage: Optional[float] = None
    lead_time_days: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool = True
    on_hand: float = 0.0
    free_to_use: float = 0.0
    total_value: float = 0.0
    created_at: Optional[datetime] = None


# -------------------------------------------------------------------------
# Warehouse & Location Schemas
# -------------------------------------------------------------------------

class LocationCreate(BaseModel):
    name: str = Field(..., min_length=1)
    short_code: str = Field(..., min_length=1)


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    warehouse_id: int
    name: str
    short_code: str
    is_active: bool = True
    created_at: Optional[datetime] = None


class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=1)
    short_code: str = Field(..., min_length=1)
    address: Optional[str] = ""


class WarehouseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_code: str
    address: Optional[str] = ""
    is_active: bool = True
    locations: List[LocationResponse] = []
    created_at: Optional[datetime] = None


# -------------------------------------------------------------------------
# Stock by Location Schemas
# -------------------------------------------------------------------------

class StockItem(BaseModel):
    product_id: int
    sku: str
    product_name: str
    category: str
    unit_of_measure: str
    per_unit_cost: float
    quantity: float
    reserved_quantity: float
    free_to_use: float
    total_value: float


class LocationStockGroup(BaseModel):
    location_id: int
    location_name: str
    location_code: str
    warehouse_id: int
    warehouse_name: str
    warehouse_code: str
    total_items_count: int
    total_stock_value: float
    items: List[StockItem]


# -------------------------------------------------------------------------
# Operation Schemas (Receipts, Deliveries, Transfers, Adjustments)
# -------------------------------------------------------------------------

class OperationLineCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    counted_quantity: Optional[float] = None


class OperationLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    operation_id: int
    product_id: int
    product_sku: Optional[str] = None
    product_name: Optional[str] = None
    unit_of_measure: Optional[str] = None
    quantity: float
    counted_quantity: Optional[float] = None
    is_out_of_stock: bool = False


class OperationCreate(BaseModel):
    type: str = Field(..., description="receipt | delivery | transfer | adjustment")
    contact_name: Optional[str] = ""
    schedule_date: Optional[date] = None
    warehouse_id: Optional[int] = None
    source_location_id: Optional[int] = None
    destination_location_id: Optional[int] = None
    delivery_address: Optional[str] = ""
    adjustment_reason: Optional[str] = ""
    lines: List[OperationLineCreate] = []


class OperationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    type: str
    status: str
    contact_name: Optional[str] = None
    schedule_date: Optional[date] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    responsible_id: Optional[int] = None
    responsible_name: Optional[str] = None
    source_location_id: Optional[int] = None
    source_location_name: Optional[str] = None
    destination_location_id: Optional[int] = None
    destination_location_name: Optional[str] = None
    delivery_address: Optional[str] = None
    adjustment_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    lines: List[OperationLineResponse] = []


# -------------------------------------------------------------------------
# Move History Schema
# -------------------------------------------------------------------------

class MoveHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    move_type: str
    product_id: int
    product_sku: Optional[str] = None
    product_name: Optional[str] = None
    quantity: float
    from_location_id: Optional[int] = None
    from_location_name: Optional[str] = None
    to_location_id: Optional[int] = None
    to_location_name: Optional[str] = None
    contact_name: Optional[str] = None
    reason: Optional[str] = None
    date: Optional[datetime] = None


# -------------------------------------------------------------------------
# Dashboard & Intelligence Schemas
# -------------------------------------------------------------------------

class DashboardKpis(BaseModel):
    total_skus: int
    total_stock_value: float
    low_stock_count: int
    out_of_stock_count: int
    pending_receipts: int
    pending_deliveries: int
    completed_operations: int


class DashboardActivity(BaseModel):
    id: int
    reference: str
    type: str
    status: str
    contact_name: Optional[str] = None
    date: Optional[datetime] = None
    description: str


class DashboardChartData(BaseModel):
    label: str
    inbound: float
    outbound: float


class DashboardData(BaseModel):
    kpis: DashboardKpis
    recent_activity: List[DashboardActivity]
    chart_data: List[DashboardChartData]


class HealthCategoryItem(BaseModel):
    product_id: int
    sku: str
    name: str
    category: str
    current_stock: float
    reorder_level: float
    avg_daily_usage: float
    days_of_stock: float
    stock_value: float
    health_status: str  # optimal | low_stock | out_of_stock | overstocked


class InventoryHealthData(BaseModel):
    health_score: int  # 0-100
    optimal_count: int
    low_stock_count: int
    out_of_stock_count: int
    overstocked_count: int
    total_inventory_value: float
    items: List[HealthCategoryItem]


class SmartReorderSuggestion(BaseModel):
    product_id: int
    sku: str
    name: str
    category: str
    current_stock: float
    reorder_level: float
    avg_daily_usage: float
    lead_time_days: int
    days_until_stockout: float
    suggested_order_qty: float
    estimated_cost: float
    urgency: str  # critical | high | medium


class ActionItem(BaseModel):
    id: str
    title: str
    description: str
    urgency: str  # critical | warning | info
    type: str  # stockout | late_delivery | low_stock | pending_validation
    action_label: str
    route_target: str
    created_at: Optional[datetime] = None
