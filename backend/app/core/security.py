"""
Security, Password Hashing & JWT Authentication Utilities.
"""

from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from backend.app.core.config import settings

# Robust password hasher supporting bcrypt and sha256_crypt
pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a salted hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate salted hash for a password."""
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create a signed JWT access token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
