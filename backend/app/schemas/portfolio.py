"""
Pydantic Schemas for Virtual Portfolios and Watchlists.
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field


class PositionEnriched(BaseModel):
    symbol: str
    name: str
    quantity: int
    avg_buy_price: float
    current_price: float
    cost_basis: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    allocation_pct: Optional[float] = 0.0


class AssetAllocation(BaseModel):
    symbol: str
    allocation_pct: float
    value: float


class PortfolioCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = ""
    initial_capital: float = Field(100000.0, gt=0)


class PositionActionRequest(BaseModel):
    symbol: str
    quantity: int = Field(..., gt=0)
    buy_price: Optional[float] = None


class PortfolioResponse(BaseModel):
    portfolio_id: str
    name: str
    description: Optional[str] = ""
    cash: float
    initial_capital: float
    total_invested: float
    current_holdings_value: float
    total_portfolio_value: float
    total_pnl: float
    total_return_pct: float
    positions: List[PositionEnriched]
    allocations: List[AssetAllocation]
    portfolio_risk: Optional[Any] = None
    last_updated: str


class WatchlistActionRequest(BaseModel):
    symbol: str
