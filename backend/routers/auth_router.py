from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    login_id: str
    password: str


@router.post("/login")
def login(payload: LoginRequest) -> dict[str, str]:
    return {"access_token": "development-token", "token_type": "bearer"}
