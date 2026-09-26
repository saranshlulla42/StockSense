from models import SessionLocal, User
from sqlalchemy.orm import Session
import bcrypt
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status, Depends
import os
import random
import re
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = "stocksense-hackathon-insecure-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def generate_otp() -> str:
    """Generates a 6-digit numeric OTP."""
    return str(random.randint(100000, 999999))


def send_verification_email(to_email: str, otp: str) -> bool:
    """
    Dispatches verification email with OTP.
    Always prints to console for seamless hackathon demoing/testing.
    Sends real email if SMTP environment variables are configured.
    """
    print("\n" + "=" * 60)
    print(f"[EMAIL DISPATCH] Verification OTP for {to_email}")
    print(f"[OTP CODE] => {otp}  (Expires in 10 minutes)")
    print("=" * 60 + "\n")

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart()
            msg["From"] = smtp_user
            msg["To"] = to_email
            msg["Subject"] = "StockSense — Verify Your Email OTP"
            body = (
                f"Hello,\n\n"
                f"Your StockSense email verification OTP is: {otp}\n\n"
                f"This code will expire in 10 minutes.\n\n"
                f"Best regards,\nStockSense Inventory Team"
            )
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            return True
        except Exception as e:
            print(
                f"[SMTP Warning] Could not send live email: {e} (Using console OTP)")
            return False
    return True


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
