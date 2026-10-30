"""
Market Data & OHLCV Endpoint Tests.
"""

from fastapi import status


def test_list_stocks(client):
    response = client.get("/api/v1/stocks")
    assert response.status_code == status.HTTP_200_OK
    stocks = response.json()
    assert isinstance(stocks, list)
    assert len(stocks) >= 5
    symbols = [s["symbol"] for s in stocks]
    assert "AAPL" in symbols
    assert "MSFT" in symbols


def test_get_stock_info(client):
    response = client.get("/api/v1/stocks/AAPL")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert "current_price" in data
    assert data["current_price"] > 0
    assert "fifty_two_week_high" in data
    assert "fifty_two_week_low" in data


def test_get_market_history(client):
    response = client.get("/api/v1/market/history/AAPL?period=3mo&interval=1d")
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["symbol"] == "AAPL"
    assert body["count"] > 10
    first_record = body["data"][0]
    assert "open" in first_record
    assert "high" in first_record
    assert "low" in first_record
    assert "close" in first_record
    assert "volume" in first_record
    assert "rsi_14" in first_record
    assert "macd" in first_record
