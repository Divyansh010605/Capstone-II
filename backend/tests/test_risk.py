"""
Financial Risk Calculation & Portfolio Risk Tests.
"""

from fastapi import status
import numpy as np
import pandas as pd
from backend.app.services.risk_service import RiskAnalysisService


def test_stock_risk_service_unit():
    service = RiskAnalysisService(risk_free_rate=0.04)
    np.random.seed(42)
    # 100 days of price series
    daily_returns = np.random.normal(0.0005, 0.015, 100)
    prices = pd.Series(100.0 * np.cumprod(1.0 + daily_returns))

    risk_metrics = service.calculate_stock_risk("UNIT_TEST", prices)
    assert risk_metrics["symbol"] == "UNIT_TEST"
    assert "risk_category" in risk_metrics
    assert risk_metrics["risk_category"] in ["Low Risk", "Medium Risk", "High Risk"]
    assert risk_metrics["annualized_volatility_pct"] > 0
    assert "95%" in risk_metrics["value_at_risk"]
    assert "99%" in risk_metrics["value_at_risk"]
    assert risk_metrics["maximum_drawdown_pct"] <= 0


def test_stock_risk_api_endpoint(client):
    response = client.get("/api/v1/risk/AAPL")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert "risk_category" in data
    assert "annualized_volatility_pct" in data
    assert "sharpe_ratio" in data
    assert "maximum_drawdown_pct" in data
    assert "value_at_risk" in data
    assert "conditional_value_at_risk" in data


def test_portfolio_risk_api_endpoint(client):
    payload = {
        "holdings": [
            {"symbol": "AAPL", "weight": 0.6},
            {"symbol": "MSFT", "weight": 0.4},
        ]
    }
    response = client.post("/api/v1/risk/portfolio", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "portfolio_volatility_pct" in data
    assert "portfolio_sharpe_ratio" in data
    assert "diversification_benefit_pct" in data
    assert "asset_weights" in data
    assert "correlation_matrix" in data
