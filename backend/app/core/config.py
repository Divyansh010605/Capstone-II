"""
Application Configuration Settings.
Loads configuration from environment variables and .env file with production defaults.
"""

import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Search and load .env from root workspace or parent dirs
_current_dir = Path(__file__).resolve().parent
_root_dir = _current_dir.parent.parent.parent
_env_candidates = [
    _root_dir / ".env",
    _root_dir / "backend" / ".env",
    Path(".env"),
]
for env_file in _env_candidates:
    if env_file.is_file():
        load_dotenv(dotenv_path=env_file, override=False)
        break


def _get_cors_origins() -> List[str]:
    default_origins = [
        "https://localhost",
        "https://127.0.0.1",
        "https://localhost:443",
        "https://127.0.0.1:443",
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080",
    ]
    env_val = os.getenv("BACKEND_CORS_ORIGINS")
    if not env_val:
        return default_origins
    if isinstance(env_val, str):
        parts = [p.strip() for p in env_val.split(",") if p.strip()]
        return parts if parts else default_origins
    return default_origins


class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv(
        "PROJECT_NAME", "AI-Based Stock Market Trend Prediction & Risk Analysis"
    )
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # JWT Authentication
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "prod-stock-ai-risk-super-secure-jwt-secret-key-32chars-min!"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/stock_market_ai")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "stock_market_ai")

    # AI Engine Microservice
    AI_ENGINE_URL: str = os.getenv("AI_ENGINE_URL", "http://localhost:8001")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "ensemble")
    PREDICTION_HORIZON_DAYS: int = int(os.getenv("PREDICTION_HORIZON_DAYS", "7"))
    LOOKBACK_WINDOW: int = int(os.getenv("LOOKBACK_WINDOW", "60"))

    # SMTP & OTP Password Reset
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "noreply@stockmarketai.internal")
    OTP_EXPIRY_MINUTES: int = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))

    # OAuth Providers
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = _get_cors_origins()


settings = Settings()
