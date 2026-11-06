"""
Standalone AI Inference Engine Service API.
Serves PyTorch LSTM, GRU, Transformer, and Stacking Ensemble predictions over HTTP.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List
import pandas as pd
from ai_engine.inference.predictor import StockPredictorEngine
from ai_engine.features.technical_indicators import compute_technical_indicators
try:
    import yfinance as yf
except ImportError:
    yf = None

app = FastAPI(title="AI Model Inference Microservice", version="2.0.0")
predictor = StockPredictorEngine(lookback_window=60)


class PredictRequest(BaseModel):
    symbol: str
    horizon: int = 7
    model: str = "ensemble"


@app.get("/health")
def health():
    return {"status": "healthy", "service": "ai_inference_engine"}


@app.post("/predict")
def predict_endpoint(req: PredictRequest):
    sym = req.symbol.upper()
    try:
        df = None
        if yf is not None:
            try:
                ticker = yf.Ticker(sym)
                df = ticker.history(period="2y")
                if df is not None and isinstance(df.columns, pd.MultiIndex):
                    df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
            except Exception:
                df = None

        if df is None or df.empty or len(df) < 50:
            from backend.app.services.market_data import MarketDataService
            ms = MarketDataService()
            df = ms.fetch_historical_ohlcv(sym, period="2y")

        result = predictor.generate_predictions(
            symbol=sym,
            df_raw=df,
            horizon=req.horizon,
            selected_model=req.model,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_engine.api:app", host="0.0.0.0", port=8001, reload=False)
