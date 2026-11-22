"""
Prediction Service.
Orchestrates AI forecasting with dual execution modes:
1. Remote Microservice: If AI_ENGINE_URL is set, queries the external FastAPI AI microservice over HTTP.
2. In-Process Engine: If AI_ENGINE_URL is unset, empty, or the remote endpoint is unavailable,
   falls back seamlessly to the direct in-process StockPredictorEngine.
"""

import os
import logging
from typing import Dict, Any, Optional
import pandas as pd
import httpx

from ai_engine.inference.predictor import StockPredictorEngine
from backend.app.core.config import settings

logger = logging.getLogger("stock_market_ai.prediction_service")


class PredictionService:
    def __init__(
        self,
        ai_engine_url: Optional[str] = None,
        predictor_engine: Optional[StockPredictorEngine] = None,
        market_service=None,
    ):
        self.ai_engine_url = (
            ai_engine_url
            if ai_engine_url is not None
            else os.getenv("AI_ENGINE_URL", getattr(settings, "AI_ENGINE_URL", None))
        )
        if self.ai_engine_url:
            self.ai_engine_url = self.ai_engine_url.strip().rstrip("/")
            if self.ai_engine_url.lower() in ("", "none", "null", "false"):
                self.ai_engine_url = None

        self.in_process_engine = predictor_engine or StockPredictorEngine(
            lookback_window=getattr(settings, "LOOKBACK_WINDOW", 60)
        )
        self.market_service = market_service

    def generate_predictions(
        self,
        symbol: str,
        df_raw: Optional[pd.DataFrame] = None,
        horizon: int = 7,
        selected_model: str = "ensemble",
        force_retrain: bool = False,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Generate predictions using remote microservice if configured, or fall back to in-process engine.
        """
        symbol = symbol.upper().strip()
        selected_model = selected_model.lower().strip()

        # 1. Attempt Remote HTTP Call if AI_ENGINE_URL is set
        if self.ai_engine_url:
            predict_url = f"{self.ai_engine_url}/predict"
            payload = {
                "symbol": symbol,
                "horizon": horizon,
                "model": selected_model,
            }
            try:
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post(predict_url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        if isinstance(data, dict) and "forecast" in data:
                            return data
                    logger.warning(
                        f"Remote AI engine at {predict_url} returned status {resp.status_code}: {resp.text}"
                    )
            except Exception as e:
                logger.warning(
                    f"Remote AI engine at {predict_url} is unavailable ({e}). Falling back to in-process engine."
                )

        # 2. Fall back to In-Process StockPredictorEngine
        if df_raw is None:
            if self.market_service is not None:
                df_raw = self.market_service.fetch_historical_ohlcv(symbol, period="2y", interval="1d")
            else:
                from backend.app.services.market_data import MarketDataService
                ms = MarketDataService()
                df_raw = ms.fetch_historical_ohlcv(symbol, period="2y", interval="1d")

        return self.in_process_engine.generate_predictions(
            symbol=symbol,
            df_raw=df_raw,
            horizon=horizon,
            selected_model=selected_model,
            force_retrain=force_retrain,
            **kwargs,
        )


prediction_service = PredictionService()

