"""
Application Configuration Settings.
Loads configuration from environment variables with production defaults.
"""

import os
from typing import List
from pydantic import BaseModel


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

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*",
    ]


settings = Settings()
