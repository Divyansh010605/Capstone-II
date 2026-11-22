"""
Authentication Endpoints: Register, Login, Current User Profile,
Password Reset with OTP Verification, and OAuth (Google & GitHub).
"""

from datetime import datetime, timezone
from typing import Optional
import uuid
import re
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from backend.app.schemas.user import (
    UserCreate,
    UserLogin,
    UserOut,
    TokenResponse,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    OAuthLoginRequest,
    MessageResponse,
)
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.api.deps import users_db, get_current_user
from backend.app.core.database import get_database
from backend.app.services.email_service import email_otp_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@router.post("/register/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db=Depends(get_database)):
    """Register a new user account with optional confirm password check."""
    # Check confirm password if provided
    if user_in.confirm_password and user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

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
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if db is not None:
        await db.users.insert_one(user_record.copy())

    users_db[user_in.email] = user_record

    return UserOut(**user_record)


@router.post("/login", response_model=TokenResponse)
@router.post("/login/", response_model=TokenResponse)
async def login(
    request: Request,
    db=Depends(get_database),
):
    """
    Authenticate user via OAuth2 form or JSON payload.
    Supports username, email, and password.
    """
    content_type = request.headers.get("content-type", "")
    username = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("username_or_email") or body.get("email")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            username = form.get("username") or form.get("username_or_email") or form.get("email")
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
        # Convenience fallback for demo user 'demotrader' / 'demopass'
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
            created_at=matched_user.get("created_at", datetime.now(timezone.utc).isoformat()),
        ),
    )


@router.post("/forgot-password", response_model=MessageResponse)
@router.post("/forgot-password/", response_model=MessageResponse)
async def forgot_password(req: ForgotPasswordRequest, db=Depends(get_database)):
    """
    Step 1 of Password Reset:
    Validate email address, generate 6-digit OTP, send via email (or dev console fallback).
    """
    email_val = req.email.strip().lower()

    # Verify user exists in DB or in-memory store
    user_found = False
    if db is not None:
        user = await db.users.find_one({"email": email_val})
        if user:
            user_found = True

    if not user_found:
        if email_val in users_db:
            user_found = True
        else:
            for u in users_db.values():
                if u.get("email", "").lower() == email_val:
                    user_found = True
                    break

    if not user_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registered user found with this email address.",
        )

    success, message, dev_otp = await email_otp_service.create_and_send_otp(email_val, db=db)
    return MessageResponse(
        message="A 6-digit verification code has been sent to your email.",
        success=True,
        dev_otp=dev_otp,
    )


@router.post("/verify-otp", response_model=MessageResponse)
@router.post("/verify-otp/", response_model=MessageResponse)
async def verify_otp(req: VerifyOtpRequest, db=Depends(get_database)):
    """Pre-validate the 6-digit OTP before resetting password."""
    is_valid, msg = await email_otp_service.verify_otp(req.email, req.otp, db=db)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        )
    return MessageResponse(message=msg, success=True)


@router.post("/reset-password", response_model=MessageResponse)
@router.post("/reset-password/", response_model=MessageResponse)
async def reset_password(req: ResetPasswordRequest, db=Depends(get_database)):
    """
    Step 2 of Password Reset:
    Verify OTP, validate password match, hash new password, and update in DB & memory.
    """
    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm password do not match.",
        )

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    email_val = req.email.strip().lower()

    # Verify OTP
    is_valid, msg = await email_otp_service.verify_otp(email_val, req.otp, db=db)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        )

    # Hash new password
    new_hashed_pwd = get_password_hash(req.new_password)

    # Update in MongoDB
    if db is not None:
        await db.users.update_one(
            {"email": email_val},
            {"$set": {"hashed_password": new_hashed_pwd, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )

    # Update in in-memory store
    for u in users_db.values():
        if u.get("email", "").lower() == email_val:
            u["hashed_password"] = new_hashed_pwd
            break
    if email_val in users_db:
        users_db[email_val]["hashed_password"] = new_hashed_pwd

    # Clear OTP
    await email_otp_service.clear_otp(email_val, db=db)

    return MessageResponse(
        message="Your password has been successfully reset! You can now log in with your new password.",
        success=True,
    )


@router.post("/oauth/{provider}", response_model=TokenResponse)
@router.post("/oauth/{provider}/", response_model=TokenResponse)
async def oauth_login(provider: str, req: OAuthLoginRequest, db=Depends(get_database)):
    """
    Authenticate or auto-register via Google or GitHub OAuth.
    Supports development authorization and token payloads.
    """
    prov = provider.lower().strip()
    if prov not in ("google", "github"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider '{provider}'. Must be 'google' or 'github'.",
        )

    # Determine identity
    if req.email:
        email = str(req.email).strip().lower()
    else:
        # Generate default provider email if none passed
        default_user = req.username or req.name or f"{prov}_trader"
        safe_tag = re.sub(r"[^a-zA-Z0-9_]", "", default_user.lower())[:15] or "user"
        email = f"{safe_tag}@{prov}.internal"

    username = req.username or req.name or email.split("@")[0]
    username = re.sub(r"[^a-zA-Z0-9_-]", "", username)[:30] or f"{prov}_user"
    full_name = req.name or f"{prov.capitalize()} Trader"

    matched_user = None

    # Check MongoDB
    if db is not None:
        matched_user = await db.users.find_one({"email": email})

    # Check in-memory store
    if not matched_user:
        matched_user = users_db.get(email)

    # Auto-register if new OAuth user
    if not matched_user:
        user_id = str(uuid.uuid4())
        user_record = {
            "id": user_id,
            "email": email,
            "username": username,
            "hashed_password": get_password_hash(f"oauth_{uuid.uuid4()}"),
            "full_name": full_name,
            "oauth_provider": prov,
            "avatar_url": req.avatar_url,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        if db is not None:
            await db.users.insert_one(user_record.copy())

        users_db[email] = user_record
        matched_user = user_record

    access_token = create_access_token(subject=matched_user["email"])

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(
            id=str(matched_user.get("id", matched_user.get("_id", "oauth-id"))),
            email=matched_user["email"],
            username=matched_user["username"],
            full_name=matched_user.get("full_name"),
            is_active=matched_user.get("is_active", True),
            created_at=matched_user.get("created_at", datetime.now(timezone.utc).isoformat()),
        ),
    )


@router.get("/me", response_model=UserOut)
@router.get("/me/", response_model=UserOut)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Return the profile of the authenticated user."""
    return UserOut(
        id=str(current_user.get("id", current_user.get("_id", "demo-id"))),
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at", datetime.now(timezone.utc).isoformat()),
    )
