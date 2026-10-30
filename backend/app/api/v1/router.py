"""
API Router Aggregator.
Combines sub-routers for Authentication, Stocks, Market Data, Predictions, Risk, Portfolio, Watchlist, and Sentiment.
"""

from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.stocks import router as stocks_router
from backend.app.api.v1.market import router as market_router
from backend.app.api.v1.predictions import router as predictions_router
from backend.app.api.v1.risk import router as risk_router
from backend.app.api.v1.portfolio import router as portfolio_router
from backend.app.api.v1.watchlist import router as watchlist_router
from backend.app.api.v1.sentiment import router as sentiment_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(stocks_router)
api_router.include_router(market_router)
api_router.include_router(predictions_router)
api_router.include_router(risk_router)
api_router.include_router(portfolio_router)
api_router.include_router(watchlist_router)
api_router.include_router(sentiment_router)
