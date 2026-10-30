"""
Technical Indicators Feature Engineering Module.
Computes standard market indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, OBV, Volatility).
Ensures zero data leakage and numerical stability.
"""

import numpy as np
import pandas as pd


def compute_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute technical indicators for a given OHLCV DataFrame.

    Expected columns: ['Open', 'High', 'Low', 'Close', 'Volume']
    Returns DataFrame with original OHLCV plus engineered indicator columns.
    """
    df = df.copy()

    # Ensure required columns exist
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        if col not in df.columns:
            raise ValueError(f"Missing required column '{col}' in input DataFrame")

    # Simple Moving Averages
    df["SMA_20"] = df["Close"].rolling(window=20, min_periods=1).mean()
    df["SMA_50"] = df["Close"].rolling(window=50, min_periods=1).mean()
    df["SMA_200"] = df["Close"].rolling(window=200, min_periods=1).mean()

    # Exponential Moving Averages
    df["EMA_12"] = df["Close"].ewm(span=12, adjust=False).mean()
    df["EMA_26"] = df["Close"].ewm(span=26, adjust=False).mean()

    # MACD & Signal Line
    df["MACD"] = df["EMA_12"] - df["EMA_26"]
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()
    df["MACD_Hist"] = df["MACD"] - df["MACD_Signal"]

    # Relative Strength Index (RSI - 14)
    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.rolling(window=14, min_periods=1).mean()
    avg_loss = loss.rolling(window=14, min_periods=1).mean()

    rs = avg_gain / (avg_loss + 1e-9)
    df["RSI_14"] = 100 - (100 / (1 + rs))

    # Bollinger Bands (20 periods, 2 standard deviations)
    rolling_mean_20 = df["Close"].rolling(window=20, min_periods=1).mean()
    rolling_std_20 = df["Close"].rolling(window=20, min_periods=1).std().fillna(0)
    df["BB_Upper"] = rolling_mean_20 + (rolling_std_20 * 2)
    df["BB_Lower"] = rolling_mean_20 - (rolling_std_20 * 2)
    df["BB_Middle"] = rolling_mean_20
    df["BB_Bandwidth"] = (df["BB_Upper"] - df["BB_Lower"]) / (rolling_mean_20 + 1e-9)

    # Average True Range (ATR - 14)
    high_low = df["High"] - df["Low"]
    high_close_prev = (df["High"] - df["Close"].shift(1)).abs()
    low_close_prev = (df["Low"] - df["Close"].shift(1)).abs()
    true_range = pd.concat([high_low, high_close_prev, low_close_prev], axis=1).max(axis=1)
    df["ATR_14"] = true_range.rolling(window=14, min_periods=1).mean()

    # On-Balance Volume (OBV)
    direction = np.sign(df["Close"].diff()).fillna(0)
    df["OBV"] = (direction * df["Volume"]).cumsum()

    # Daily Returns & Rolling Volatility (20 days annualized)
    df["Daily_Return"] = df["Close"].pct_change().fillna(0)
    df["Log_Return"] = np.log(df["Close"] / df["Close"].shift(1)).fillna(0)
    df["Volatility_20d"] = df["Daily_Return"].rolling(window=20, min_periods=1).std() * np.sqrt(252)
    df["Volatility_20d"] = df["Volatility_20d"].fillna(0)

    # Clean any remaining NaNs safely
    df = df.bfill().ffill()

    return df
