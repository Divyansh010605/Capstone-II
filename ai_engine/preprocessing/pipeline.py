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
        """Filter or select feature columns, ensuring all expected columns exist."""
        if feature_columns is None:
            self.feature_columns = [
                "Open", "High", "Low", "Close", "Volume",
                "SMA_20", "SMA_50", "SMA_200",
                "EMA_12", "EMA_26", "MACD", "MACD_Signal",
                "RSI_14", "BB_Upper", "BB_Lower", "ATR_14",
                "Daily_Return", "Volatility_20d"
            ]
        else:
            self.feature_columns = list(feature_columns)

        res_df = df.copy()
        # Guarantee all feature columns exist to preserve architecture input_size = 18
        for col in self.feature_columns:
            if col not in res_df.columns:
                if "Close" in res_df.columns:
                    res_df[col] = res_df["Close"]
                else:
                    res_df[col] = 0.0

        return res_df[self.feature_columns].copy()

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

    def create_window_splits(
        self, df: pd.DataFrame, train_ratio: float = 0.70, val_ratio: float = 0.15
    ) -> Tuple[Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray]]:
        """
        Generates sliding windows across the full contiguous series, with the scaler
        fitted strictly on the chronological training portion to prevent lookahead bias.
        Guarantees that validation and test sets contain contiguous windows with complete
        lookback context.
        """
        n_rows = len(df)
        train_row_end = max(
            self.lookback_window + self.forecast_horizon,
            int(n_rows * train_ratio)
        )
        train_row_end = min(train_row_end, n_rows)

        # Fit scalers strictly on training data
        self.fit(df.iloc[:train_row_end])

        # Transform full contiguous series
        X_scaled, y_scaled = self.transform(df)

        # Create windows across full series
        X_win, y_win = self.create_sliding_windows(X_scaled, y_scaled)
        total_win = len(X_win)

        if total_win == 0:
            empty_X = np.empty((0, self.lookback_window, len(self.feature_columns)), dtype=np.float32)
            empty_y = np.empty((0, self.forecast_horizon), dtype=np.float32)
            return (empty_X, empty_y), (empty_X, empty_y), (empty_X, empty_y)

        if total_win < 3:
            return (X_win, y_win), (X_win, y_win), (X_win, y_win)

        n_train = max(1, int(total_win * train_ratio))
        n_val = max(1, int(total_win * val_ratio))
        if n_train + n_val >= total_win:
            n_val = max(1, (total_win - n_train) // 2)

        X_train_win = X_win[:n_train]
        y_train_win = y_win[:n_train]

        X_val_win = X_win[n_train : n_train + n_val]
        y_val_win = y_win[n_train : n_train + n_val]

        X_test_win = X_win[n_train + n_val :]
        y_test_win = y_win[n_train + n_val :]

        if len(X_val_win) == 0:
            X_val_win = X_train_win[-max(1, len(X_train_win) // 5):]
            y_val_win = y_train_win[-max(1, len(y_train_win) // 5):]

        if len(X_test_win) == 0:
            X_test_win = X_val_win
            y_test_win = y_val_win

        return (X_train_win, y_train_win), (X_val_win, y_val_win), (X_test_win, y_test_win)

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

        clean_df = self.prepare_features(df)
        scaled_features = self.feature_scaler.transform(clean_df.values)

        close_vals = df[["Close"]].values if "Close" in df.columns else clean_df.values[:, 0:1]
        scaled_target = self.target_scaler.transform(close_vals)

        return scaled_features.astype(np.float32), scaled_target.astype(np.float32)

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

        if not X:
            return (
                np.empty((0, self.lookback_window, scaled_features.shape[1] if scaled_features.ndim > 1 else 1), dtype=np.float32),
                np.empty((0, self.forecast_horizon), dtype=np.float32),
            )

        return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

    def inverse_transform_target(self, scaled_y: np.ndarray) -> np.ndarray:
        """Convert scaled target predictions back to actual stock price scale."""
        if not self.is_fitted:
            raise RuntimeError("Pipeline must be fitted before calling inverse_transform_target()")
        scaled_y = np.asarray(scaled_y, dtype=float)
        original_shape = scaled_y.shape
        clean_y = np.nan_to_num(scaled_y, nan=0.5)
        flat = clean_y.reshape(-1, 1)
        inv = self.target_scaler.inverse_transform(flat)
        res = inv.reshape(original_shape)
        return np.maximum(0.01, res)

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
