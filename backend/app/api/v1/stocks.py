"""
Stock Information Endpoints: List Tracked Stocks & Fetch Asset Profiles.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.stock import StockBase, StockInfo
from backend.app.api.deps import market_service
from backend.app.core.database import get_database

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("", response_model=List[StockBase])
@router.get("/", response_model=List[StockBase])
async def list_stocks():
    """List available and tracked market stocks."""
    stocks = market_service.get_available_stocks()
    return [StockBase(**s) for s in stocks]


@router.get("/{symbol}", response_model=StockInfo)
@router.get("/{symbol}/", response_model=StockInfo)
async def get_stock_details(symbol: str, db=Depends(get_database)):
    """Retrieve detailed real-time market profile and financial indicators for a symbol."""
    sym = symbol.upper().strip()
    try:
        info = market_service.fetch_stock_info(sym)

        # Store or update in MongoDB if connected
        if db is not None:
            await db.stocks.update_one(
                {"symbol": sym},
                {"$set": info},
                upsert=True,
            )

        return StockInfo(**info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock information for {sym}: {str(e)}")
