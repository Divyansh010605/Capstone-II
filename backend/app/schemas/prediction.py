"""
Pydantic Schemas for AI Predictions, Horizons, and Evaluation Metrics.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel


class ForecastPoint(BaseModel):
    step: int
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float
    lstm: Optional[float] = None
    gru: Optional[float] = None
    transformer: Optional[float] = None
    ensemble: Optional[float] = None


class ModelEvaluationMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float
    directional_accuracy: float


class PredictionResponse(BaseModel):
    symbol: str
    horizon_days: int
    selected_model: str
    current_price: float
    predicted_final_price: float
    trend: str  # Bullish, Bearish, Sideways
    expected_return_pct: float
    recommendation: str
    confidence_level_pct: float
    is_calibrated: bool
    evaluation_metrics: ModelEvaluationMetrics
    all_models_metrics: Optional[Dict[str, ModelEvaluationMetrics]] = None
    ensemble_weights: Optional[Dict[str, float]] = None
    forecast: List[ForecastPoint]
    disclaimer: str
