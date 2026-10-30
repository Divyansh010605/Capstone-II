"""
Pydantic Schemas for Stocks & Historical Market OHLCV Data.
"""

from typing import List, Optional
from pydantic import BaseModel


class StockBase(BaseModel):
    symbol: str
    name: str
    sector: Optional[str] = None


class StockInfo(StockBase):
    industry: Optional[str] = None
    currency: str = "USD"
    current_price: float
    previous_close: float
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    summary: Optional[str] = None
    last_updated: str


class OHLCVRecord(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi_14: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_lower: Optional[float] = None


class HistoricalDataResponse(BaseModel):
    symbol: str
    period: str
    interval: str
    count: int
    data: List[OHLCVRecord]
