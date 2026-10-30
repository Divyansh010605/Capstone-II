"""
FastAPI Dependencies: Auth token extraction, Service singletons, DB instances.
"""

from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.core.database import get_database
from backend.app.services.market_data import MarketDataService
from backend.app.services.risk_service import RiskAnalysisService
from backend.app.services.sentiment_service import SentimentAnalysisService
from backend.app.services.portfolio_service import PortfolioService
from ai_engine.inference.predictor import StockPredictorEngine

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)

# Service singletons
market_service = MarketDataService()
risk_service = RiskAnalysisService()
sentiment_service = SentimentAnalysisService()
portfolio_service = PortfolioService(market_service, risk_service)
prediction_engine = StockPredictorEngine(lookback_window=60)

# In-memory users store for tests or standalone operation
users_db: Dict[str, Dict[str, Any]] = {
    "demo@example.com": {
        "id": "demo-user-1",
        "email": "demo@example.com",
        "username": "demotrader",
        "hashed_password": "$pbkdf2-sha256$29000$g.2j0xO1H4V2lS5j7W8k0A$jW4dGvM0H1Q2O3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j",
        "full_name": "Demo Financial Analyst",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00",
    }
}


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db=Depends(get_database),
) -> Dict[str, Any]:
    """Retrieve current authenticated user or return demo user if unauthenticated in dev/guest mode."""
    if not token:
        # Allow default guest/demo context for easy Swagger testing
        return {
            "id": "demo-user",
            "email": "demo@example.com",
            "username": "demotrader",
            "full_name": "Demo Trader",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00",
        }

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_identifier = payload["sub"]

    # Check MongoDB if connected
    if db is not None:
        user = await db.users.find_one({"$or": [{"email": user_identifier}, {"username": user_identifier}]})
        if user:
            user["id"] = str(user.get("_id", user.get("id")))
            return user

    # Check in-memory store
    for user in users_db.values():
        if user["email"] == user_identifier or user["username"] == user_identifier:
            return user

    return {
        "id": user_identifier,
        "email": f"{user_identifier}@example.com",
        "username": user_identifier,
        "is_active": True,
        "created_at": "2024-01-01T00:00:00",
    }
