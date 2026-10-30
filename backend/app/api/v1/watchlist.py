"""
Watchlist Management Endpoints: Quick Tracking & Real-Time Monitoring.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.stock import StockInfo
from backend.app.schemas.portfolio import WatchlistActionRequest
from backend.app.api.deps import portfolio_service, get_current_user
from backend.app.core.database import get_database

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", response_model=List[StockInfo])
async def get_user_watchlist(current_user: dict = Depends(get_current_user)):
    """Retrieve all symbols currently on the user's watchlist with current price details."""
    user_id = str(current_user["id"])
    watchlist_items = portfolio_service.get_watchlist(user_id=user_id)
    return [StockInfo(**item) for item in watchlist_items]


@router.post("", response_model=List[str])
async def add_stock_to_watchlist(
    action: WatchlistActionRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    """Add a stock symbol to the user's watchlist."""
    user_id = str(current_user["id"])
    symbol = action.symbol.upper().strip()

    symbols = portfolio_service.add_to_watchlist(user_id=user_id, symbol=symbol)

    if db is not None:
        await db.watchlists.update_one(
            {"user_id": user_id},
            {"$addToSet": {"symbols": symbol}},
            upsert=True,
        )

    return symbols


@router.delete("/{symbol}", response_model=List[str])
async def remove_stock_from_watchlist(
    symbol: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    """Remove a stock symbol from the user's watchlist."""
    user_id = str(current_user["id"])
    symbol = symbol.upper().strip()

    symbols = portfolio_service.remove_from_watchlist(user_id=user_id, symbol=symbol)

    if db is not None:
        await db.watchlists.update_one(
            {"user_id": user_id},
            {"$pull": {"symbols": symbol}},
        )

    return symbols
