"""
AI Predictions Endpoints: Deep Learning Forecasts (LSTM, GRU, Transformer, Ensemble).
Computes calibrated confidence intervals, trend classification, and backtest evaluation metrics.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query, Depends
from backend.app.schemas.prediction import PredictionResponse
from backend.app.api.deps import market_service, prediction_engine
from backend.app.core.database import get_database

router = APIRouter(prefix="/predictions", tags=["AI Predictions"])


@router.get("/{symbol}", response_model=PredictionResponse)
@router.get("/{symbol}/", response_model=PredictionResponse)
async def generate_stock_predictions(
    symbol: str,
    horizon: int = Query(7, ge=1, le=30, description="Forecast horizon in days (1-30)"),
    model: str = Query("ensemble", description="Selected model: ensemble, lstm, gru, transformer"),
    db=Depends(get_database),
):
    """
    Generate future stock price predictions using PyTorch models.
    Returns forecasted prices with calibrated 95% confidence intervals,
    trend classification (Bullish/Bearish/Sideways), and backtest evaluation metrics.
    """
    sym = symbol.upper().strip()
    try:
        # Fetch 2 years of daily data for rich training & evaluation
        df_hist = market_service.fetch_historical_ohlcv(sym, period="2y", interval="1d")

        result = prediction_engine.generate_predictions(
            symbol=sym,
            df_raw=df_hist,
            horizon=horizon,
            selected_model=model.lower(),
        )

        # Store in MongoDB predictions collection for tracking
        if db is not None:
            pred_record = {
                "symbol": sym,
                "horizon_days": horizon,
                "model": model.lower(),
                "trend": result["trend"],
                "predicted_final_price": result["predicted_final_price"],
                "evaluation_metrics": result["evaluation_metrics"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.predictions.insert_one(pred_record)

        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Prediction error for {sym}: {str(e)}"
        )
