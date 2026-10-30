"""
Chronological Time Series Data Preprocessing & Leak-Free Pipeline.
Enforces strict chronological train/val/test splits, sliding window generation,
and isolated MinMax scaling fitted strictly on training data to prevent lookahead bias.
"""

from typing import Tuple, List, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler


class TimeSeriesDataPipeline:
    def __init__(self, lookback_window: int = 60, forecast_horizon: int = 7):
        self.lookback_window = lookback_window
        self.forecast_horizon = forecast_horizon
        self.feature_scaler = MinMaxScaler(feature_range=(0, 1))
        self.target_scaler = MinMaxScaler(feature_range=(0, 1))
        self.feature_columns: List[str] = []
        self.is_fitted = False

    def prepare_features(self, df: pd.DataFrame, feature_columns: Optional[List[str]] = None) -> pd.DataFrame:
        """Filter or select feature columns, defaulting to all numerical columns."""
        if feature_columns is None:
            self.feature_columns = [
                "Open", "High", "Low", "Close", "Volume",
                "SMA_20", "SMA_50", "SMA_200",
                "EMA_12", "EMA_26", "MACD", "MACD_Signal",
                "RSI_14", "BB_Upper", "BB_Lower", "ATR_14",
                "Daily_Return", "Volatility_20d"
            ]
        else:
            self.feature_columns = feature_columns

        # Verify existence of columns
        available_cols = [c for c in self.feature_columns if c in df.columns]
        if not available_cols:
            available_cols = ["Close"]
        self.feature_columns = available_cols
        return df[self.feature_columns].copy()

    def chronological_split(
        self, df: pd.DataFrame, train_ratio: float = 0.70, val_ratio: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Perform strict chronological train/val/test split without shuffling.
        Prevents look-ahead bias and simulates real-world forward testing.
        """
        n = len(df)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))

        train_df = df.iloc[:train_end]
        val_df = df.iloc[train_end:val_end]
        test_df = df.iloc[val_end:]

        return train_df, val_df, test_df

    def fit(self, train_df: pd.DataFrame):
        """Fit scalers strictly on training data."""
        clean_train = self.prepare_features(train_df)
        self.feature_scaler.fit(clean_train.values)

        # Target scaler fitted strictly on training 'Close' price
        target_vals = train_df[["Close"]].values if "Close" in train_df else clean_train.values[:, 0:1]
        self.target_scaler.fit(target_vals)
        self.is_fitted = True

    def transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Transform features and target using fitted scalers."""
        if not self.is_fitted:
            raise RuntimeError("Pipeline must be fitted before calling transform()")

        features_df = df[self.feature_columns]
        scaled_features = self.feature_scaler.transform(features_df.values)
        scaled_target = self.target_scaler.transform(df[["Close"]].values)

        return scaled_features, scaled_target

    def create_sliding_windows(
        self, scaled_features: np.ndarray, scaled_target: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create (X, y) sliding windows.
        X shape: (num_samples, lookback_window, num_features)
        y shape: (num_samples, forecast_horizon)
        """
        X, y = [], []
        total_steps = len(scaled_features)

        for i in range(self.lookback_window, total_steps - self.forecast_horizon + 1):
            X.append(scaled_features[i - self.lookback_window : i])
            # Multi-step ahead forecast for target (Close price)
            y.append(scaled_target[i : i + self.forecast_horizon, 0])

        return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

    def inverse_transform_target(self, scaled_y: np.ndarray) -> np.ndarray:
        """Convert scaled target predictions back to actual stock price scale."""
        original_shape = scaled_y.shape
        flat = scaled_y.reshape(-1, 1)
        inv = self.target_scaler.inverse_transform(flat)
        return inv.reshape(original_shape)

    def walk_forward_splits(
        self, df: pd.DataFrame, n_splits: int = 3, min_train_size: int = 250, test_size: int = 60
    ):
        """
        Generate expanding walk-forward cross-validation splits.
        In each fold, training set expands forward in time, followed by validation.
        """
        n = len(df)
        for i in range(n_splits):
            train_end = min_train_size + i * test_size
            test_end = min(train_end + test_size, n)
            if train_end >= n:
                break
            train_fold = df.iloc[:train_end]
            test_fold = df.iloc[train_end:test_end]
            yield train_fold, test_fold
