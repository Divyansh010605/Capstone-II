"""
AI Engine & Prediction Endpoint Tests.
"""

try:
    from fastapi import status
except ImportError:
    class _Status:
        HTTP_200_OK = 200
    status = _Status()
import numpy as np
import pandas as pd
from ai_engine.features.technical_indicators import compute_technical_indicators
from ai_engine.evaluation.metrics import evaluate_forecast


def test_technical_indicators_computation():
    dates = pd.date_range("2023-01-01", periods=60)
    df = pd.DataFrame(
        {
            "Open": np.linspace(100, 120, 60),
            "High": np.linspace(102, 122, 60),
            "Low": np.linspace(98, 118, 60),
            "Close": np.linspace(100, 120, 60),
            "Volume": np.full(60, 10000),
        },
        index=dates,
    )
    result = compute_technical_indicators(df)
    assert "SMA_20" in result.columns
    assert "EMA_12" in result.columns
    assert "RSI_14" in result.columns
    assert "MACD" in result.columns
    assert "BB_Upper" in result.columns
    assert not result.isna().any().any()


def test_forecast_evaluation_metrics():
    y_true = np.array([100.0, 102.0, 104.0, 103.0])
    y_pred = np.array([101.0, 101.5, 103.5, 103.0])
    metrics = evaluate_forecast(y_true, y_pred)
    assert metrics["mae"] > 0
    assert metrics["rmse"] > 0
    assert metrics["mape"] > 0
    assert 0 <= metrics["directional_accuracy"] <= 100.0


def test_prediction_api_endpoint(client):
    response = client.get("/api/v1/predictions/AAPL?horizon=7&model=ensemble")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["horizon_days"] == 7
    assert data["trend"] in ["Bullish", "Bearish", "Sideways"]
    assert "current_price" in data
    assert "predicted_final_price" in data
    assert "evaluation_metrics" in data
    assert "mae" in data["evaluation_metrics"]
    assert len(data["forecast"]) == 7
    assert data["is_calibrated"] is True
