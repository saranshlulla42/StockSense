from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class HealthResponse(BaseModel):
    status: str


# -------------------------------------------------------------------------
# Auth & User Schemas
# -------------------------------------------------------------------------

class UserBase(BaseModel):
    login_id: str = Field(..., min_length=6, max_length=12)
    email: str
    full_name: str
    role: str = Field(default="inventory_manager")


class UserSignup(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    login_id: str
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
