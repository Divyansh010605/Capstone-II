"""
Pydantic Schemas for User Registration, Authentication, Password Reset & JWT Tokens.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: Optional[str] = None
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: Optional[str] = None
    username_or_email: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=8)


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=8)
    new_password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)


class OAuthLoginRequest(BaseModel):
    provider: str = Field(..., description="google or github")
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    oauth_token: Optional[str] = None
    code: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True
    dev_otp: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
