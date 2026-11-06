"""
Pydantic Schemas for User Registration, Authentication & JWT Tokens.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: Optional[str] = None
    username_or_email: Optional[str] = None
    password: str


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
