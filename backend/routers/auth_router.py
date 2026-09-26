from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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
    validate_signup_credentials,
    generate_otp,
    send_verification_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    """
    Registers a new user and sends an email verification OTP.
    - Login ID: 6–12 alphanumeric characters
    - Email: valid format
    - Password: 8+ chars, with lowercase, uppercase, and special character
    """
    # 1. Validate credentials with specific format rules
    validate_signup_credentials(
        payload.login_id, payload.email, payload.password)

    # 2. Check for existing login_id or email
    existing_user = db.query(User).filter(
        (User.login_id == payload.login_id) | (User.email == payload.email)
    ).first()

    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    if existing_user:
        if existing_user.is_verified:
            if existing_user.login_id == payload.login_id:
                raise HTTPException(
                    status_code=400, detail="Login ID already registered.")
            else:
                raise HTTPException(
                    status_code=400, detail="Email already registered.")
        else:
            # User exists but not verified yet: update password and send new OTP
            existing_user.login_id = payload.login_id
            existing_user.password_hash = get_password_hash(payload.password)
            existing_user.full_name = payload.full_name
            existing_user.role = payload.role
            existing_user.otp_code = otp
            existing_user.otp_expires_at = otp_expiry
            db.commit()

            send_verification_email(payload.email, otp)
            return SignupResponse(
                message="Verification OTP sent to your email.",
                email=payload.email,
                requires_otp=True,
                demo_otp=otp,
            )

    # 3. Create new unverified user with OTP
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        login_id=payload.login_id,
        email=payload.email,
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

    # 4. Dispatch verification email / log OTP
    send_verification_email(payload.email, otp)

    return SignupResponse(
        message="Verification OTP sent to your email.",
        email=payload.email,
        requires_otp=True,
        demo_otp=otp,
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verifies the email OTP on first signup and returns the JWT authentication token.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_verified:
        # Already verified: generate token
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

    # Mark user as verified and clear OTP
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


@router.post("/resend-otp")
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    """
    Resends a fresh OTP to the user's email.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User with this email does not exist.")

    if user.is_verified:
        return {"message": "Email is already verified. Please sign in with your password."}

    new_otp = generate_otp()
    user.otp_code = new_otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_verification_email(user.email, new_otp)
    return {
        "message": "A new OTP has been sent to your email.",
        "email": user.email,
        "demo_otp": new_otp,
    }


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user with Login ID and Password.
    Subsequent sign-ins only require password.
    """
    user = db.query(User).filter(
        User.login_id == payload.login_id,
        User.is_active == True
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login Id or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if first-time email verification was completed
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


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated user profile.
    """
    return UserResponse.model_validate(current_user)
