"""
Calibrated Time Series Ensemble Model.
Combines LSTM, GRU, and Transformer predictions using inverse-variance weights.
Calculates statistically calibrated confidence intervals using empirical validation errors.
"""

import os
from typing import Dict, List, Tuple, Optional
import numpy as np
import torch


class EnsemblePredictor:
    def __init__(self, weights: Dict[str, float] = None):
        """
        weights: Dictionary mapping model_name -> weight.
        If None, equal weighting (1/3 each) is used as default.
        """
        if weights is None:
            self.weights = {"lstm": 0.35, "gru": 0.35, "transformer": 0.30}
        else:
            filtered = {k: float(v) for k, v in weights.items() if k.lower() != "ensemble" and v > 0}
            total = sum(filtered.values())
            if total > 0:
                self.weights = {k: v / total for k, v in filtered.items()}
            else:
                self.weights = {"lstm": 0.35, "gru": 0.35, "transformer": 0.30}

        self.calibrated_residuals: Dict[str, np.ndarray] = {}

    def update_weights_from_val_errors(self, val_errors: Dict[str, float]):
        """
        Calculate optimal inverse-MSE weights:
        w_i = (1 / MSE_i) / sum(1 / MSE_j)
        """
        inv_errors = {}
        for model_name, mse in val_errors.items():
            if model_name.lower() == "ensemble":
                continue
            if mse is None or np.isnan(mse) or np.isinf(mse) or mse <= 0:
                continue
            safe_mse = max(float(mse), 1e-6)
            inv_errors[model_name] = 1.0 / safe_mse

        total_inv = sum(inv_errors.values())
        if total_inv > 0 and not np.isnan(total_inv) and not np.isinf(total_inv):
            self.weights = {k: v / total_inv for k, v in inv_errors.items()}
        else:
            base_models = [m for m in val_errors.keys() if m.lower() != "ensemble"]
            if not base_models:
                base_models = ["lstm", "gru", "transformer"]
            self.weights = {k: 1.0 / len(base_models) for k in base_models}

    def calibrate_confidence_intervals(
        self, y_val_true: np.ndarray, y_val_preds: Dict[str, np.ndarray]
    ):
        """
        Calibrate prediction intervals using empirical residuals from validation data.
        Stored residuals allow computing exact empirical quantiles (e.g. 95% interval).
        """
        y_val_true = np.asarray(y_val_true, dtype=float)
        valid_preds = {}

        for model_name, preds in y_val_preds.items():
            if model_name.lower() == "ensemble":
                continue
            arr = np.asarray(preds, dtype=float)
            if not np.isnan(arr).any() and not np.isinf(arr).any() and arr.shape == y_val_true.shape:
                residuals = y_val_true - arr
                self.calibrated_residuals[model_name] = residuals
                valid_preds[model_name] = arr

        # Also calibrate ensemble residuals if valid predictions exist
        if valid_preds:
            active_weights = {m: self.weights.get(m, 1.0 / len(valid_preds)) for m in valid_preds}
            total_w = sum(active_weights.values())
            if total_w > 0:
                active_weights = {m: w / total_w for m, w in active_weights.items()}
            ens_pred = sum(active_weights[m] * preds for m, preds in valid_preds.items())
            self.calibrated_residuals["ensemble"] = y_val_true - ens_pred

    def predict(
        self, predictions: Dict[str, np.ndarray], confidence_level: float = 0.95
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Combine predictions and compute statistically calibrated confidence bands.

        Returns:
            ensemble_pred: np.ndarray of forecasted prices
            lower_bound: np.ndarray of lower confidence bound
            upper_bound: np.ndarray of upper confidence bound
            calibrated_confidence: float percentage
        """
        # Filter out 'ensemble' key to avoid recursive combining
        candidates = [m for m in predictions.keys() if m.lower() != "ensemble"]
        if not candidates:
            candidates = list(predictions.keys())

        # Validate candidate arrays: exclude any model output with NaNs or empty
        valid_models = []
        for m in candidates:
            arr = np.asarray(predictions[m], dtype=float)
            if arr.size > 0 and not np.isnan(arr).any() and not np.isinf(arr).any():
                valid_models.append(m)

        if not valid_models:
            # Absolute fallback if all models failed
            first_val = np.asarray(next(iter(predictions.values())), dtype=float)
            fallback = np.nan_to_num(first_val, nan=100.0)
            return fallback, fallback * 0.95, fallback * 1.05, 95.0

        # Normalize active weights for valid models
        active_weights = {m: self.weights.get(m, 1.0 / len(valid_models)) for m in valid_models}
        total_w = sum(active_weights.values())
        if total_w <= 0:
            active_weights = {m: 1.0 / len(valid_models) for m in valid_models}
        else:
            active_weights = {m: w / total_w for m, w in active_weights.items()}

        # Weighted prediction
        ensemble_pred = np.zeros_like(np.asarray(predictions[valid_models[0]], dtype=float), dtype=float)
        for m in valid_models:
            ensemble_pred += active_weights[m] * np.asarray(predictions[m], dtype=float)

        horizon = ensemble_pred.shape[-1]
        time_decay = np.sqrt(np.arange(1, horizon + 1))

        # Calibrate error dispersion
        if "ensemble" in self.calibrated_residuals and len(self.calibrated_residuals["ensemble"]) >= 5:
            resids = np.asarray(self.calibrated_residuals["ensemble"], dtype=float)
            alpha = (1.0 - confidence_level) / 2.0
            if resids.ndim == 2 and resids.shape[-1] == horizon:
                q_low = np.percentile(resids, alpha * 100, axis=0)
                q_high = np.percentile(resids, (1.0 - alpha) * 100, axis=0)
                margin = (np.abs(q_low) + np.abs(q_high)) / 2.0
            else:
                q_low = np.percentile(resids, alpha * 100)
                q_high = np.percentile(resids, (1.0 - alpha) * 100)
                margin = ((abs(q_low) + abs(q_high)) / 2.0) * time_decay
        else:
            # Model agreement dispersion fallback (standard deviation among models)
            if len(valid_models) > 1:
                pred_stack = np.array([predictions[m] for m in valid_models], dtype=float)
                inter_model_std = np.std(pred_stack, axis=0)
            else:
                inter_model_std = ensemble_pred * 0.015

            base_margin = 1.96 * np.maximum(inter_model_std, ensemble_pred * 0.015)
            if ensemble_pred.ndim == 2:
                margin = base_margin * time_decay[np.newaxis, :]
            else:
                margin = base_margin * time_decay

        # Ensure margin is at least 1% of expected price
        margin = np.maximum(margin, ensemble_pred * 0.01)

        lower_bound = ensemble_pred - margin
        upper_bound = ensemble_pred + margin

        # Stock price sanity: lower bound cannot be negative or zero
        lower_bound = np.maximum(0.01, lower_bound)
        upper_bound = np.maximum(upper_bound, ensemble_pred + 0.01)
        lower_bound = np.minimum(lower_bound, ensemble_pred)

        calibrated_confidence = round(confidence_level * 100.0, 1)
        return ensemble_pred, lower_bound, upper_bound, calibrated_confidence

    def predict_for_model(
        self, selected_model: str, predictions: Dict[str, np.ndarray], confidence_level: float = 0.95
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Compute predictions and calibrated confidence intervals specifically centered on selected_model.
        """
        selected_model = selected_model.lower()
        if selected_model == "ensemble" or selected_model not in predictions:
            return self.predict(predictions, confidence_level=confidence_level)

        model_pred = np.asarray(predictions[selected_model], dtype=float)
        horizon = model_pred.shape[-1]
        time_decay = np.sqrt(np.arange(1, horizon + 1))

        if selected_model in self.calibrated_residuals and len(self.calibrated_residuals[selected_model]) >= 5:
            resids = np.asarray(self.calibrated_residuals[selected_model], dtype=float)
            alpha = (1.0 - confidence_level) / 2.0
            if resids.ndim == 2 and resids.shape[-1] == horizon:
                q_low = np.percentile(resids, alpha * 100, axis=0)
                q_high = np.percentile(resids, (1.0 - alpha) * 100, axis=0)
                margin = (np.abs(q_low) + np.abs(q_high)) / 2.0
            else:
                q_low = np.percentile(resids, alpha * 100)
                q_high = np.percentile(resids, (1.0 - alpha) * 100)
                margin = ((abs(q_low) + abs(q_high)) / 2.0) * time_decay
        else:
            margin = 1.96 * (model_pred * 0.02) * time_decay

        margin = np.maximum(margin, model_pred * 0.01)
        lower_bound = np.maximum(0.01, model_pred - margin)
        upper_bound = np.maximum(model_pred + margin, model_pred + 0.01)
        lower_bound = np.minimum(lower_bound, model_pred)

        calibrated_confidence = round(confidence_level * 100.0, 1)
        return model_pred, lower_bound, upper_bound, calibrated_confidence

    def save(self, filepath: str):
        """Save ensemble state and calibrated residuals to checkpoint."""
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        payload = {
            "weights": self.weights,
            "calibrated_residuals": {
                k: v.tolist() if isinstance(v, np.ndarray) else v
                for k, v in self.calibrated_residuals.items()
            },
        }
        torch.save(payload, filepath)

    def load(self, filepath: str) -> bool:
        """Load ensemble state and calibrated residuals from checkpoint."""
        if not filepath or not os.path.exists(filepath):
            return False
        try:
            try:
                payload = torch.load(filepath, map_location="cpu", weights_only=True)
            except Exception:
                payload = torch.load(filepath, map_location="cpu", weights_only=False)

            if isinstance(payload, dict):
                if "weights" in payload and isinstance(payload["weights"], dict):
                    self.weights = payload["weights"]
                if "calibrated_residuals" in payload and isinstance(payload["calibrated_residuals"], dict):
                    self.calibrated_residuals = {
                        k: np.asarray(v, dtype=float)
                        for k, v in payload["calibrated_residuals"].items()
                    }
                return True
            return False
        except Exception:
            return False

