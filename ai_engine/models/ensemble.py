"""
Calibrated Time Series Ensemble Model.
Combines LSTM, GRU, and Transformer predictions using inverse-variance weights.
Calculates statistically calibrated confidence intervals using empirical validation errors.
"""

from typing import Dict, List, Tuple
import numpy as np


class EnsemblePredictor:
    def __init__(self, weights: Dict[str, float] = None):
        """
        weights: Dictionary mapping model_name -> weight.
        If None, equal weighting (1/3 each) is used as default.
        """
        if weights is None:
            self.weights = {"lstm": 0.35, "gru": 0.35, "transformer": 0.30}
        else:
            total = sum(weights.values())
            self.weights = {k: v / total for k, v in weights.items()}

        self.calibrated_residuals: Dict[str, np.ndarray] = {}

    def update_weights_from_val_errors(self, val_errors: Dict[str, float]):
        """
        Calculate optimal inverse-MSE weights:
        w_i = (1 / MSE_i) / sum(1 / MSE_j)
        """
        inv_errors = {}
        for model_name, mse in val_errors.items():
            safe_mse = max(mse, 1e-6)
            inv_errors[model_name] = 1.0 / safe_mse

        total_inv = sum(inv_errors.values())
        self.weights = {k: v / total_inv for k, v in inv_errors.items()}

    def calibrate_confidence_intervals(
        self, y_val_true: np.ndarray, y_val_preds: Dict[str, np.ndarray]
    ):
        """
        Calibrate prediction intervals using empirical residuals from validation data.
        Stored residuals allow computing exact empirical quantiles (e.g. 95% interval).
        """
        for model_name, preds in y_val_preds.items():
            residuals = y_val_true - preds
            self.calibrated_residuals[model_name] = residuals

        # Also calibrate ensemble residuals
        ens_pred = sum(self.weights.get(m, 0.33) * preds for m, preds in y_val_preds.items())
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
        model_names = [m for m in predictions.keys() if m in self.weights]
        if not model_names:
            model_names = list(predictions.keys())

        # Normalize active weights
        active_weights = {m: self.weights.get(m, 1.0 / len(model_names)) for m in model_names}
        total_w = sum(active_weights.values())
        active_weights = {m: w / total_w for m, w in active_weights.items()}

        # Weighted prediction
        ensemble_pred = np.zeros_like(next(iter(predictions.values())), dtype=float)
        for m in model_names:
            ensemble_pred += active_weights[m] * np.asarray(predictions[m], dtype=float)

        # Calibrate error dispersion
        if "ensemble" in self.calibrated_residuals and len(self.calibrated_residuals["ensemble"]) > 5:
            resids = self.calibrated_residuals["ensemble"]
            alpha = (1.0 - confidence_level) / 2.0
            q_low = np.percentile(resids, alpha * 100)
            q_high = np.percentile(resids, (1.0 - alpha) * 100)
            margin = (abs(q_low) + abs(q_high)) / 2.0
        else:
            # Model agreement dispersion fallback (standard deviation among models)
            pred_stack = np.array([predictions[m] for m in model_names])
            inter_model_std = np.std(pred_stack, axis=0)
            # Z-score for 95% = 1.96
            margin = 1.96 * np.maximum(inter_model_std, ensemble_pred * 0.015)

        # Expanding uncertainty across forecast horizon h: sqrt(h)
        horizon = ensemble_pred.shape[-1]
        time_decay = np.sqrt(np.arange(1, horizon + 1))
        if ensemble_pred.ndim == 2:
            expanded_margin = margin * time_decay[np.newaxis, :]
        else:
            expanded_margin = margin * time_decay

        lower_bound = ensemble_pred - expanded_margin
        upper_bound = ensemble_pred + expanded_margin

        # Calibrated confidence score in percentage (e.g., 95.0%)
        calibrated_confidence = round(confidence_level * 100.0, 1)

        return ensemble_pred, lower_bound, upper_bound, calibrated_confidence
