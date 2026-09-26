import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from models import SessionLocal, User

SECRET_KEY = "stocksense-hackathon-insecure-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def validate_signup_credentials(login_id: str, email: str, password: str):
    """Enforces Excalidraw specs for sign up."""
    # 6-12 alphanumeric characters
    if not re.match(r"^[a-zA-Z0-9]{6,12}$", login_id):
        raise HTTPException(
            status_code=400,
            detail="Login ID must be 6-12 alphanumeric characters."
        )
    # Email format
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email address format."
        )
    # Password: 8+ chars, lowercase, uppercase, special character
    if len(password) < 8 or not re.search(r"[a-z]", password) or not re.search(r"[A-Z]", password) or not re.search(r"[\W_]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long and contain uppercase, lowercase, and special characters."
        )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login_id: str = payload.get("sub")
        if login_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.login_id == login_id,
                                 User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user
