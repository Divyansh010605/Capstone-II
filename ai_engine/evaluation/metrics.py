"""
Time Series Evaluation Metrics for AI Stock Predictions.
Includes MAE, RMSE, MAPE, Directional Accuracy, and Confidence Interval Coverage.
"""

from typing import Dict
import numpy as np


def mean_absolute_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Error (MAE)."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return float(np.mean(np.abs(y_true - y_pred)))


def root_mean_squared_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Root Mean Squared Error (RMSE)."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Percentage Error (MAPE)."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    # Avoid zero division
    denominator = np.where(np.abs(y_true) < 1e-6, 1e-6, np.abs(y_true))
    return float(np.mean(np.abs((y_true - y_pred) / denominator)) * 100.0)


def directional_accuracy(y_true: np.ndarray, y_pred: np.ndarray, y_base: np.ndarray = None) -> float:
    """
    Calculate Directional Accuracy (Hit Rate).
    Measures percentage of correctly predicted upward/downward directions.
    If y_base is provided, compares (y_true - y_base) vs (y_pred - y_base).
    Otherwise, compares sequential price differences.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    if len(y_true) < 2:
        return 100.0

    if y_base is not None:
        y_base = np.asarray(y_base, dtype=float)
        actual_dir = np.sign(y_true - y_base)
        pred_dir = np.sign(y_pred - y_base)
    else:
        actual_dir = np.sign(np.diff(y_true))
        pred_dir = np.sign(np.diff(y_pred))

    matches = np.sum(actual_dir == pred_dir)
    return float((matches / len(actual_dir)) * 100.0)


def confidence_interval_coverage(y_true: np.ndarray, lower_bound: np.ndarray, upper_bound: np.ndarray) -> float:
    """
    Calculate the empirical coverage probability of the predicted confidence intervals.
    Target for 95% interval is ~95%.
    """
    y_true = np.asarray(y_true, dtype=float)
    lower_bound = np.asarray(lower_bound, dtype=float)
    upper_bound = np.asarray(upper_bound, dtype=float)

    inside = np.logical_and(y_true >= lower_bound, y_true <= upper_bound)
    return float((np.sum(inside) / len(y_true)) * 100.0)


def evaluate_forecast(y_true: np.ndarray, y_pred: np.ndarray, y_base: np.ndarray = None) -> Dict[str, float]:
    """Calculate all standard evaluation metrics for a forecast."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = root_mean_squared_error(y_true, y_pred)
    mape = mean_absolute_percentage_error(y_true, y_pred)
    da = directional_accuracy(y_true, y_pred, y_base=y_base)

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "mape": round(mape, 4),
        "directional_accuracy": round(da, 2),
    }
