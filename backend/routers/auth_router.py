import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models import User
from schemas import (
    UserSignup,
    UserLogin,
    UserResponse,
    TokenResponse,
    SignupResponse,
    VerifyOtpRequest,
    ResendOtpRequest,
)
from auth import (
    get_db,
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    generate_otp,
    send_verification_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Helper: derive a safe login_id from an email address
# ---------------------------------------------------------------------------

def _derive_login_id(email: str, db: Session) -> str:
    """
    Generates a unique 6-12 alphanumeric login_id from the email local-part.
    e.g. "ved.sarode@gmail.com" -> "vedsarode" or "vedsarod1" if taken.
    """
    local = email.split("@")[0]
    # Keep only alphanumeric characters
    base = re.sub(r"[^a-zA-Z0-9]", "", local)[:12]
    # Ensure minimum length
    if len(base) < 6:
        base = (base + "user00")[:6]

    candidate = base
    suffix = 1
    while db.query(User).filter(User.login_id == candidate).first():
        candidate = (base[:11] + str(suffix))[:12]
        suffix += 1

    return candidate


# ---------------------------------------------------------------------------
# POST /signup  (and /register alias for route.md compat)
# ---------------------------------------------------------------------------

def _signup_handler(payload: UserSignup, db: Session) -> SignupResponse:
    """
    Shared signup logic used by both /signup and /register.
    Accepts { full_name, email, password }.
    login_id is auto-derived from the email local-part.
    """
    email = payload.email.strip().lower()

    # Basic email format check
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        raise HTTPException(
            status_code=400, detail="Invalid email address format.")

    # Password strength check
    pwd = payload.password
    if (
        len(pwd) < 8
        or not re.search(r"[a-z]", pwd)
        or not re.search(r"[A-Z]", pwd)
        or not re.search(r"[\W_]", pwd)
    ):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and contain uppercase, lowercase, and a special character.",
        )

    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=400, detail="Email already registered.")
        else:
            # Not verified yet — refresh data and send new OTP
            existing_user.full_name = payload.full_name
            existing_user.password_hash = get_password_hash(pwd)
            existing_user.role = payload.role
            existing_user.otp_code = otp
            existing_user.otp_expires_at = otp_expiry
            db.commit()
            send_verification_email(email, otp)
            return SignupResponse(
                message="Verification OTP sent to your email.",
                email=email,
                requires_otp=True,
                demo_otp=otp,
            )

    # Derive a unique login_id
    login_id = _derive_login_id(email, db)

    hashed_pwd = get_password_hash(pwd)
    new_user = User(
        login_id=login_id,
        email=email,
        password_hash=hashed_pwd,
        full_name=payload.full_name,
        role=payload.role,
        is_active=True,
        is_verified=False,
        otp_code=otp,
        otp_expires_at=otp_expiry,
    )
    db.add(new_user)
    db.commit()

    send_verification_email(email, otp)

    return SignupResponse(
        message="Verification OTP sent to your email.",
        email=email,
        requires_otp=True,
        demo_otp=otp,
    )


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    """
    Registers a new user with name, email, and password.
    A 6-digit OTP is sent to the email for first-time verification.
    login_id is auto-derived from the email prefix.
    """
    return _signup_handler(payload, db)


@router.post("/register", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserSignup, db: Session = Depends(get_db)):
    """Alias for /signup — matches route.md API contract."""
    return _signup_handler(payload, db)


# ---------------------------------------------------------------------------
# POST /verify-otp
# ---------------------------------------------------------------------------

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verifies the email OTP on first signup and returns the JWT.
    """
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_verified:
        # Already verified — generate a fresh token
        token = create_access_token(
            data={"sub": user.login_id, "role": user.role})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    if not user.otp_code or user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400, detail="OTP has expired. Please request a new one.")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.login_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


# ---------------------------------------------------------------------------
# POST /resend-otp
# ---------------------------------------------------------------------------

@router.post("/resend-otp")
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    """
    Resends a fresh OTP to the user's email.
    """
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User with this email does not exist.")

    if user.is_verified:
        return {"message": "Email is already verified. Please sign in with your password."}

    new_otp = generate_otp()
    user.otp_code = new_otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_verification_email(email, new_otp)
    return {
        "message": "A new OTP has been sent to your email.",
        "email": email,
        "demo_otp": new_otp,
    }


# ---------------------------------------------------------------------------
# POST /login  — accepts email OR login_id in the "identifier" field
# ---------------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user.
    - identifier: accepts either the user's email address OR their login_id.
    - Subsequent sign-ins require only password (no OTP).
    """
    identifier = payload.identifier.strip()

    # Determine whether it looks like an email or a login_id
    if "@" in identifier:
        user = db.query(User).filter(
            User.email == identifier.lower(),
            User.is_active == True,
        ).first()
    else:
        user = db.query(User).filter(
            User.login_id == identifier,
            User.is_active == True,
        ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Enforce first-time email verification
    if not user.is_verified:
        now = datetime.utcnow()
        if not user.otp_code or not user.otp_expires_at or user.otp_expires_at < now:
            user.otp_code = generate_otp()
            user.otp_expires_at = now + timedelta(minutes=10)
            db.commit()

        send_verification_email(user.email, user.otp_code)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Email not verified. A verification OTP has been sent to {user.email}.",
        )

    token = create_access_token(data={"sub": user.login_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the current authenticated user's profile."""
    return UserResponse.model_validate(current_user)
