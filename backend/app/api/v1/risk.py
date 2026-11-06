"""
Financial Risk Analysis Endpoints: Volatility, VaR, CVaR, Drawdown, Sharpe, Sortino.
"""

from datetime import datetime, timezone
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.risk import StockRiskResponse, PortfolioRiskRequest, PortfolioRiskResponse
from backend.app.api.deps import market_service, risk_service
from backend.app.core.database import get_database

router = APIRouter(prefix="/risk", tags=["Financial Risk Analysis"])


@router.get("", tags=["Financial Risk Analysis"])
@router.get("/", tags=["Financial Risk Analysis"])
async def get_risk_service_info():
    """Overview of quantitative risk models and methodology."""
    return {
        "status": "operational",
        "methodologies": [
            "Parametric Value-at-Risk (Delta-Normal)",
            "Historical Value-at-Risk",
            "Monte Carlo Simulation (10,000 paths GBM)",
            "Conditional Value-at-Risk (CVaR / Expected Shortfall)",
            "Maximum Peak-to-Trough Drawdown",
            "Annualized Sharpe & Sortino Ratios",
            "Multi-Asset Covariance & Diversification Benefit",
        ],
        "risk_free_rate_pct": 4.0,
        "confidence_levels": ["95%", "99%"],
    }


@router.post("/portfolio", response_model=PortfolioRiskResponse)
@router.post("/portfolio/", response_model=PortfolioRiskResponse)
async def evaluate_portfolio_risk(request: PortfolioRiskRequest):
    """
    Calculate multi-asset portfolio risk, volatility, diversification benefit,
    and asset return correlation matrix for arbitrary allocations.
    """
    if not request.holdings:
        raise HTTPException(status_code=400, detail="Holdings list cannot be empty.")

    holdings_dict = [{"symbol": h.symbol.upper(), "weight": h.weight} for h in request.holdings]
    price_series = {}

    try:
        for h in holdings_dict:
            sym = h["symbol"]
            df_hist = market_service.fetch_historical_ohlcv(sym, period="1y")
            price_series[sym] = df_hist["Close"]

        price_df = pd.DataFrame(price_series).dropna()
        port_risk = risk_service.calculate_portfolio_risk(holdings_dict, price_df)
        return PortfolioRiskResponse(**port_risk)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate portfolio risk: {str(e)}"
        )


@router.get("/{symbol}", response_model=StockRiskResponse)
@router.get("/{symbol}/", response_model=StockRiskResponse)
async def get_stock_risk_metrics(symbol: str, db=Depends(get_database)):
    """
    Calculate comprehensive quantitative financial risk metrics for a stock.
    Computes Volatility, Parametric/Historical/Monte Carlo VaR, CVaR,
    Maximum Drawdown, Sharpe & Sortino ratios, and categorizes into Low/Medium/High Risk.
    """
    sym = symbol.upper().strip()
    try:
        df_hist = market_service.fetch_historical_ohlcv(sym, period="1y", interval="1d")
        risk_data = risk_service.calculate_stock_risk(sym, df_hist["Close"])

        # Persist to MongoDB risk_metrics collection
        if db is not None:
            await db.risk_metrics.insert_one(
                {
                    "symbol": sym,
                    "risk_category": risk_data["risk_category"],
                    "annualized_volatility_pct": risk_data["annualized_volatility_pct"],
                    "sharpe_ratio": risk_data["sharpe_ratio"],
                    "maximum_drawdown_pct": risk_data["maximum_drawdown_pct"],
                    "calculated_at": datetime.now(timezone.utc).isoformat(),
                }
            )

        return StockRiskResponse(**risk_data)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Risk calculation error for {sym}: {str(e)}"
        )
