"""
Authentication Endpoints: Register, Login, Current User Profile.
"""

from datetime import datetime
from typing import Optional
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from backend.app.schemas.user import UserCreate, UserLogin, UserOut, TokenResponse
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.api.deps import users_db, get_current_user
from backend.app.core.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db=Depends(get_database)):
    """Register a new user account."""
    # Check if user already exists in DB
    if db is not None:
        existing = await db.users.find_one({"$or": [{"email": user_in.email}, {"username": user_in.username}]})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email or username already exists.",
            )

    # Check in-memory store
    for u in users_db.values():
        if u["email"] == user_in.email or u["username"] == user_in.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email or username already exists.",
            )

    user_id = str(uuid.uuid4())
    hashed_pwd = get_password_hash(user_in.password)
    user_record = {
        "id": user_id,
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_pwd,
        "full_name": user_in.full_name or user_in.username,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }

    if db is not None:
        await db.users.insert_one(user_record.copy())

    users_db[user_in.email] = user_record

    return UserOut(**user_record)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    db=Depends(get_database),
):
    """
    Authenticate user via OAuth2 form or JSON payload.
    Supports Swagger Authorize button and JSON clients.
    """
    content_type = request.headers.get("content-type", "")
    username = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("username_or_email")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing username or password",
        )

    matched_user = None

    # Search in DB
    if db is not None:
        matched_user = await db.users.find_one({"$or": [{"email": username}, {"username": username}]})

    # Fallback to in-memory store
    if not matched_user:
        for u in users_db.values():
            if u["email"] == username or u["username"] == username:
                matched_user = u
                break

    if not matched_user or not verify_password(password, matched_user["hashed_password"]):
        # Convenience fallback for demo username 'demotrader' / 'password123'
        if username in ("demotrader", "demo@example.com") and password in ("demopass", "password123", "demo"):
            matched_user = users_db.get("demo@example.com")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    access_token = create_access_token(subject=matched_user["email"])

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(
            id=str(matched_user.get("id", matched_user.get("_id", "demo-id"))),
            email=matched_user["email"],
            username=matched_user["username"],
            full_name=matched_user.get("full_name"),
            is_active=matched_user.get("is_active", True),
            created_at=matched_user.get("created_at", datetime.utcnow().isoformat()),
        ),
    )


@router.get("/me", response_model=UserOut)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Return the profile of the authenticated user."""
    return UserOut(
        id=str(current_user.get("id", current_user.get("_id", "demo-id"))),
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at", datetime.utcnow().isoformat()),
    )
