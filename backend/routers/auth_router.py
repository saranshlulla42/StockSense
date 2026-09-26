from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models import User
from schemas import UserSignup, UserLogin, UserResponse, TokenResponse
from auth import (
    get_db,
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    validate_signup_credentials,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    """
    Registers a new user with Excalidraw validation rules:
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
    if existing_user:
        if existing_user.login_id == payload.login_id:
            raise HTTPException(
                status_code=400, detail="Login ID already registered.")
        else:
            raise HTTPException(
                status_code=400, detail="Email already registered.")

    # 3. Hash password and persist user
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        login_id=payload.login_id,
        email=payload.email,
        password_hash=hashed_pwd,
        full_name=payload.full_name,
        role=payload.role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Generate access token
    token = create_access_token(
        data={"sub": new_user.login_id, "role": new_user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user and returns JWT token.
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
