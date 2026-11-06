"""
Pydantic Schemas for Financial Risk Metrics & Portfolio Risk.
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, field_validator


class VaRDetail(BaseModel):
    parametric_var_pct: float
    historical_var_pct: float
    monte_carlo_var_pct: float
    composite_var_pct: float


class CVaRDetail(BaseModel):
    cvar_pct: float
    description: str


class StockRiskResponse(BaseModel):
    symbol: str
    risk_category: str  # Low Risk, Medium Risk, High Risk
    risk_score: Union[int, float]  # 0 to 100
    risk_description: str
    annualized_volatility_pct: float
    annualized_return_pct: float
    sharpe_ratio: float
    sortino_ratio: float
    maximum_drawdown_pct: float
    mdd_peak_date: str
    mdd_trough_date: str
    value_at_risk: Dict[str, VaRDetail]
    conditional_value_at_risk: Dict[str, CVaRDetail]
    methodology_notes: Dict[str, Any]


class PortfolioHoldingWeight(BaseModel):
    symbol: str
    weight: float = Field(..., ge=0.0)

    @field_validator("weight")
    @classmethod
    def normalize_weight(cls, v: float) -> float:
        # If passed as percentage (e.g. 25.0 instead of 0.25), normalize to decimal
        if v > 1.0 and v <= 100.0:
            return round(v / 100.0, 4)
        return round(v, 4)


class PortfolioRiskRequest(BaseModel):
    holdings: List[PortfolioHoldingWeight]


class PortfolioRiskResponse(BaseModel):
    portfolio_risk_category: str
    portfolio_volatility_pct: float
    portfolio_annualized_return_pct: float
    portfolio_sharpe_ratio: float
    diversification_benefit_pct: float
    portfolio_var_95_pct: float
    portfolio_cvar_95_pct: float
    asset_weights: Dict[str, float]
    correlation_matrix: Dict[str, Dict[str, float]]
