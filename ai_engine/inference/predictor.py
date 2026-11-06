"""
AI Inference Engine for Multi-Horizon Stock Trend Prediction & Evaluation.
Executes LSTM, GRU, Transformer, and Ensemble models with calibrated uncertainty bands.
"""

import os
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import torch

from ai_engine.features.technical_indicators import compute_technical_indicators
from ai_engine.preprocessing.pipeline import TimeSeriesDataPipeline
from ai_engine.models.lstm_model import LSTMForecaster
from ai_engine.models.gru_model import GRUForecaster
from ai_engine.models.transformer_model import TimeSeriesTransformer
from ai_engine.models.ensemble import EnsemblePredictor
from ai_engine.training.trainer import ModelTrainer
from ai_engine.evaluation.metrics import evaluate_forecast


class StockPredictorEngine:
    def __init__(
        self,
        lookback_window: int = 60,
        models_dir: str = "ai_engine/saved_models",
        device: str = "cpu",
    ):
        self.lookback_window = lookback_window
        # Resolve models_dir to an absolute path anchored at this file's location,
        # so it is CWD-independent regardless of how uvicorn / Docker launches the app.
        _this_dir = os.path.dirname(os.path.abspath(__file__))
        _repo_root = os.path.abspath(os.path.join(_this_dir, "..", ".."))
        self.models_dir = (
            models_dir if os.path.isabs(models_dir)
            else os.path.join(_repo_root, models_dir)
        )
        self.device = device
        os.makedirs(self.models_dir, exist_ok=True)

    def classify_trend(self, current_price: float, predicted_final_price: float) -> Dict[str, Any]:
        """
        Classifies stock trend into Bullish, Bearish, or Sideways based on forecasted return.
        Threshold: +/- 1.5%
        """
        if current_price <= 0:
            return {"trend": "Sideways", "expected_return_pct": 0.0, "strength": "Neutral"}

        pct_change = ((predicted_final_price - current_price) / current_price) * 100.0

        if pct_change >= 1.5:
            trend = "Bullish"
            strength = "Strong Buy" if pct_change >= 5.0 else "Moderate Buy"
        elif pct_change <= -1.5:
            trend = "Bearish"
            strength = "Strong Sell" if pct_change <= -5.0 else "Moderate Sell"
        else:
            trend = "Sideways"
            strength = "Hold / Consolidation"

        return {
            "trend": trend,
            "expected_return_pct": round(pct_change, 2),
            "strength": strength,
        }

    def generate_predictions(
        self,
        symbol: str,
        df_raw: pd.DataFrame,
        horizon: int = 7,
        selected_model: str = "ensemble",
    ) -> Dict[str, Any]:
        """
        Full inference and evaluation workflow:
        1. Feature engineering
        2. Chronological split (train/val/test)
        3. Fit models or load checkpoints
        4. Predict future horizon
        5. Compute calibrated confidence intervals
        6. Compute historical backtest metrics (MAE, RMSE, MAPE, Directional Accuracy)
        """
        if len(df_raw) < (self.lookback_window + horizon + 20):
            raise ValueError(
                f"Insufficient historical data ({len(df_raw)} bars). Need at least {self.lookback_window + horizon + 20} bars."
            )

        # 1. Feature Engineering
        featured_df = compute_technical_indicators(df_raw)

        # 2. Chronological Preprocessing
        pipeline = TimeSeriesDataPipeline(
            lookback_window=self.lookback_window, forecast_horizon=horizon
        )

        train_df, val_df, test_df = pipeline.chronological_split(
            featured_df, train_ratio=0.70, val_ratio=0.15
        )

        pipeline.fit(train_df)
        num_features = len(pipeline.feature_columns)

        # Transform splits
        X_train_s, y_train_s = pipeline.transform(train_df)
        X_val_s, y_val_s = pipeline.transform(val_df)
        X_test_s, y_test_s = pipeline.transform(test_df)

        X_train_win, y_train_win = pipeline.create_sliding_windows(X_train_s, y_train_s)
        X_val_win, y_val_win = pipeline.create_sliding_windows(X_val_s, y_val_s)
        X_test_win, y_test_win = pipeline.create_sliding_windows(X_test_s, y_test_s)

        # If val or test windows are small due to short dataset, fall back safely
        if len(X_val_win) == 0:
            X_val_win, y_val_win = X_train_win[-10:], y_train_win[-10:]
        if len(X_test_win) == 0:
            X_test_win, y_test_win = X_val_win[-10:], y_val_win[-10:]

        # 3. Initialize PyTorch Architectures
        models = {
            "lstm": LSTMForecaster(input_size=num_features, output_size=horizon),
            "gru": GRUForecaster(input_size=num_features, output_size=horizon),
            "transformer": TimeSeriesTransformer(input_size=num_features, output_size=horizon),
        }

        trainers = {}
        val_preds_scaled = {}
        test_preds_scaled = {}
        val_errors = {}

        # Fast training / fine-tuning with early stopping
        for model_name, model_arch in models.items():
            trainer = ModelTrainer(model_arch, learning_rate=2e-3, device=self.device)
            save_ckpt = os.path.join(self.models_dir, f"{symbol.upper()}_{model_name}_h{horizon}.pt")

            # Train with modest epochs for fast responsive inference
            trainer.fit(
                X_train_win,
                y_train_win,
                X_val_win,
                y_val_win,
                epochs=15,
                batch_size=32,
                patience=4,
                save_path=save_ckpt,
            )
            trainers[model_name] = trainer

            # Evaluate on validation split
            v_pred = trainer.predict(X_val_win)
            val_preds_scaled[model_name] = v_pred
            mse = float(np.mean((y_val_win - v_pred) ** 2))
            val_errors[model_name] = mse

            # Evaluate on test split
            t_pred = trainer.predict(X_test_win)
            test_preds_scaled[model_name] = t_pred

        # 4. Ensemble Calibration
        ensemble = EnsemblePredictor()
        ensemble.update_weights_from_val_errors(val_errors)

        # Convert validation preds to price scale for calibration
        y_val_true_prices = pipeline.inverse_transform_target(y_val_win)
        val_preds_prices = {
            m: pipeline.inverse_transform_target(val_preds_scaled[m]) for m in models.keys()
        }
        ensemble.calibrate_confidence_intervals(y_val_true_prices, val_preds_prices)

        # 5. Inference for Future Horizon (Using the most recent window)
        # We need enough rows so that after transform we can extract exactly one
        # lookback_window-length window.  `pipeline.transform` scales row-by-row
        # (MinMaxScaler) without windowing, so we scale the last `lookback_window`
        # rows and reshape them into a single (1, lookback_window, num_features) batch.
        tail_df = featured_df.iloc[-self.lookback_window:]
        if len(tail_df) < self.lookback_window:
            raise ValueError(
                f"Not enough rows for inference window: need {self.lookback_window}, "
                f"got {len(tail_df)} after feature engineering."
            )
        latest_features, _ = pipeline.transform(tail_df)
        # latest_features shape: (lookback_window, num_features)
        # Wrap in batch dimension → (1, lookback_window, num_features)
        X_latest = latest_features[np.newaxis, :, :]  # explicit, avoids expand_dims ambiguity

        future_predictions_by_model = {}
        for model_name, trainer in trainers.items():
            scaled_future = trainer.predict(X_latest)
            price_future = pipeline.inverse_transform_target(scaled_future)[0]
            future_predictions_by_model[model_name] = price_future

        # Compute ensemble forecast & calibrated intervals
        ens_future, lower_ci, upper_ci, conf_pct = ensemble.predict(
            future_predictions_by_model, confidence_level=0.95
        )
        future_predictions_by_model["ensemble"] = ens_future

        # Pick selected forecast
        chosen_preds = future_predictions_by_model.get(selected_model, ens_future)
        current_price = float(featured_df["Close"].iloc[-1])
        final_predicted_price = float(chosen_preds[-1])

        # Trend Classification
        trend_info = self.classify_trend(current_price, final_predicted_price)

        # 6. Historical Test Backtest Metrics (Actual vs Predicted)
        y_test_true_prices = pipeline.inverse_transform_target(y_test_win)
        test_preds_prices = {
            m: pipeline.inverse_transform_target(test_preds_scaled[m]) for m in models.keys()
        }
        test_ens_prices, _, _, _ = ensemble.predict(test_preds_prices)
        test_preds_prices["ensemble"] = test_ens_prices

        eval_metrics_by_model = {}
        for m_name, preds_arr in test_preds_prices.items():
            # Evaluate on 1-step or avg across horizon
            metrics = evaluate_forecast(
                y_test_true_prices[:, 0], preds_arr[:, 0]
            )
            eval_metrics_by_model[m_name] = metrics

        # Generate future forecast dates
        last_date = pd.to_datetime(featured_df.index[-1])
        future_dates = [
            (last_date + pd.Timedelta(days=i + 1)).strftime("%Y-%m-%d")
            for i in range(horizon)
        ]

        forecast_points = []
        for i in range(horizon):
            forecast_points.append(
                {
                    "step": i + 1,
                    "date": future_dates[i],
                    "predicted_price": round(float(chosen_preds[i]), 2),
                    "lower_bound": round(float(lower_ci[i]), 2),
                    "upper_bound": round(float(upper_ci[i]), 2),
                    "lstm": round(float(future_predictions_by_model["lstm"][i]), 2),
                    "gru": round(float(future_predictions_by_model["gru"][i]), 2),
                    "transformer": round(float(future_predictions_by_model["transformer"][i]), 2),
                    "ensemble": round(float(future_predictions_by_model["ensemble"][i]), 2),
                }
            )

        return {
            "symbol": symbol.upper(),
            "horizon_days": horizon,
            "selected_model": selected_model,
            "current_price": round(current_price, 2),
            "predicted_final_price": round(final_predicted_price, 2),
            "trend": trend_info["trend"],
            "expected_return_pct": trend_info["expected_return_pct"],
            "recommendation": trend_info["strength"],
            "confidence_level_pct": conf_pct,
            "is_calibrated": True,
            "evaluation_metrics": eval_metrics_by_model.get(selected_model, eval_metrics_by_model["ensemble"]),
            "all_models_metrics": eval_metrics_by_model,
            "ensemble_weights": {k: round(v, 4) for k, v in ensemble.weights.items()},
            "forecast": forecast_points,
            "disclaimer": "AI forecasts are experimental estimates based on historical statistical patterns and are NOT financial advice.",
        }
