"""
Market History Endpoints: OHLCV Candle Streams & Technical Indicators.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from backend.app.schemas.stock import HistoricalDataResponse, OHLCVRecord
from backend.app.api.deps import market_service
from backend.app.core.database import get_database

router = APIRouter(prefix="/market", tags=["Market Data"])


@router.get("/history/{symbol}", response_model=HistoricalDataResponse)
@router.get("/history/{symbol}/", response_model=HistoricalDataResponse)
async def get_historical_market_data(
    symbol: str,
    period: str = Query("1y", description="Time horizon: 1mo, 3mo, 6mo, 1y, 2y, 5y"),
    interval: str = Query("1d", description="Data interval: 1d, 1wk"),
    db=Depends(get_database),
):
    """
    Retrieve historical OHLCV data with precomputed technical indicators.
    Saves clean records to MongoDB for historical tracking.
    """
    sym = symbol.upper().strip()
    try:
        records = market_service.get_historical_records(sym, period=period, interval=interval)

        # Upsert latest points into MongoDB if connected
        if db is not None and records:
            bulk_ops = [
                {
                    "symbol": sym,
                    "date": r["date"],
                    "open": r["open"],
                    "high": r["high"],
                    "low": r["low"],
                    "close": r["close"],
                    "volume": r["volume"],
                }
                for r in records[-30:]  # keep recent 30 in cache
            ]
            for op in bulk_ops:
                await db.historical_prices.update_one(
                    {"symbol": sym, "date": op["date"]},
                    {"$set": op},
                    upsert=True,
                )

        return HistoricalDataResponse(
            symbol=sym,
            period=period,
            interval=interval,
            count=len(records),
            data=[OHLCVRecord(**r) for r in records],
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve market history for {sym}: {str(e)}"
        )
