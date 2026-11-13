"""
Comprehensive End-to-End API Test Suite.
Validates all endpoints requested:
- stocks list
- market history
- AI predictions
- risk metrics
- sentiment
- portfolio
- watchlist
- auth and health
Ensures no 422 or 500 errors on valid requests and verifies response JSON structure.
"""

import pytest
from fastapi import status


@pytest.fixture(scope="module")
def auth_token(client):
    """Obtain a valid bearer token for tests."""
    user_payload = {
        "email": "test_endpoint_runner@example.com",
        "username": "endpointrunner",
        "password": "Password123!",
        "full_name": "Endpoint Runner",
    }
    client.post("/api/v1/auth/register", json=user_payload)
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "endpointrunner", "password": "Password123!"},
    )
    assert login_resp.status_code == status.HTTP_200_OK
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestHealthAndRootEndpoints:
    def test_root_endpoint(self, client):
        res = client.get("/")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["status"] == "online"
        assert "version" in data

    def test_health_endpoint(self, client):
        res = client.get("/health")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["status"] == "healthy"
        assert "services" in data
        assert data["services"]["ai_engine"] == "operational"


class TestStocksEndpoints:
    def test_list_stocks(self, client):
        for path in ["/api/v1/stocks", "/api/v1/stocks/"]:
            res = client.get(path)
            assert res.status_code == status.HTTP_200_OK
            stocks = res.json()
            assert isinstance(stocks, list)
            assert len(stocks) > 0
            for s in stocks:
                assert "symbol" in s
                assert "name" in s

    def test_get_stock_details_popular(self, client):
        for sym in ["AAPL", "MSFT", "NVDA", "SPY"]:
            res = client.get(f"/api/v1/stocks/{sym}")
            assert res.status_code == status.HTTP_200_OK
            data = res.json()
            assert data["symbol"] == sym
            assert "current_price" in data
            assert data["current_price"] > 0
            assert "fifty_two_week_high" in data
            assert "fifty_two_week_low" in data

    def test_get_stock_details_arbitrary(self, client):
        res = client.get("/api/v1/stocks/UNKNOWN99")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["symbol"] == "UNKNOWN99"
        assert "current_price" in data


class TestMarketHistoryEndpoints:
    def test_market_history_defaults(self, client):
        res = client.get("/api/v1/market/history/AAPL")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["symbol"] == "AAPL"
        assert data["count"] > 0
        assert len(data["data"]) == data["count"]
        first = data["data"][0]
        assert "open" in first
        assert "high" in first
        assert "low" in first
        assert "close" in first
        assert "volume" in first
        assert "rsi_14" in first
        assert "macd" in first

    @pytest.mark.parametrize("period", ["1mo", "3mo", "6mo", "1y", "2y"])
    def test_market_history_periods(self, client, period):
        res = client.get(f"/api/v1/market/history/MSFT?period={period}&interval=1d")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["symbol"] == "MSFT"
        assert data["count"] > 0

    def test_market_history_weekly_interval(self, client):
        res = client.get("/api/v1/market/history/AAPL?period=1y&interval=1wk")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] > 0


class TestAIPredictionsEndpoints:
    def test_predictions_info(self, client):
        for path in ["/api/v1/predictions", "/api/v1/predictions/"]:
            res = client.get(path)
            assert res.status_code == status.HTTP_200_OK
            info = res.json()
            assert "available_models" in info
            assert "ensemble" in info["available_models"]

    @pytest.mark.parametrize("model", ["ensemble", "lstm", "gru", "transformer"])
    def test_predictions_models(self, client, model):
        res = client.get(f"/api/v1/predictions/AAPL?horizon=7&model={model}")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["symbol"] == "AAPL"
        assert data["selected_model"] == model
        assert data["horizon_days"] == 7
        assert data["trend"] in ["Bullish", "Bearish", "Sideways"]
        assert len(data["forecast"]) == 7
        assert "evaluation_metrics" in data
        assert data["evaluation_metrics"]["mae"] >= 0.0

    @pytest.mark.parametrize("horizon", [1, 5, 14, 30])
    def test_predictions_horizons(self, client, horizon):
        res = client.get(f"/api/v1/predictions/NVDA?horizon={horizon}&model=ensemble")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["horizon_days"] == horizon
        assert len(data["forecast"]) == horizon


class TestRiskMetricsEndpoints:
    def test_risk_info(self, client):
        for path in ["/api/v1/risk", "/api/v1/risk/"]:
            res = client.get(path)
            assert res.status_code == status.HTTP_200_OK
            data = res.json()
            assert "methodologies" in data
            assert data["status"] == "operational"

    def test_stock_risk_metrics(self, client):
        for sym in ["AAPL", "MSFT", "TSLA"]:
            res = client.get(f"/api/v1/risk/{sym}")
            assert res.status_code == status.HTTP_200_OK
            data = res.json()
            assert data["symbol"] == sym
            assert data["risk_category"] in ["Low Risk", "Medium Risk", "High Risk"]
            assert "annualized_volatility_pct" in data
            assert "sharpe_ratio" in data
            assert "sortino_ratio" in data
            assert "maximum_drawdown_pct" in data
            assert "value_at_risk" in data
            assert "95%" in data["value_at_risk"]
            assert "99%" in data["value_at_risk"]
            assert "conditional_value_at_risk" in data

    def test_portfolio_risk_calculation(self, client):
        payload = {
            "holdings": [
                {"symbol": "AAPL", "weight": 0.40},
                {"symbol": "MSFT", "weight": 0.35},
                {"symbol": "NVDA", "weight": 0.25},
            ]
        }
        res = client.post("/api/v1/risk/portfolio", json=payload)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert "portfolio_risk_category" in data
        assert "portfolio_volatility_pct" in data
        assert "portfolio_sharpe_ratio" in data
        assert "diversification_benefit_pct" in data
        assert "asset_weights" in data
        assert "correlation_matrix" in data

    def test_portfolio_risk_percentage_weights(self, client):
        # Weights given as 40.0, 35.0, 25.0 should be auto-normalized
        payload = {
            "holdings": [
                {"symbol": "AAPL", "weight": 40.0},
                {"symbol": "MSFT", "weight": 35.0},
                {"symbol": "NVDA", "weight": 25.0},
            ]
        }
        res = client.post("/api/v1/risk/portfolio", json=payload)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert "portfolio_volatility_pct" in data


class TestSentimentEndpoints:
    def test_sentiment_info(self, client):
        for path in ["/api/v1/sentiment", "/api/v1/sentiment/"]:
            res = client.get(path)
            assert res.status_code == status.HTTP_200_OK
            data = res.json()
            assert data["status"] == "operational"
            assert "analyzer" in data

    def test_stock_sentiment(self, client):
        for sym in ["AAPL", "NVDA", "TSLA"]:
            res = client.get(f"/api/v1/sentiment/{sym}")
            assert res.status_code == status.HTTP_200_OK
            data = res.json()
            assert data["symbol"] == sym
            assert data["overall_sentiment"] in ["Positive", "Neutral", "Negative"]
            assert -1.0 <= data["sentiment_score"] <= 1.0
            assert 0.0 <= data["sentiment_index_100"] <= 100.0
            assert "breakdown" in data
            assert "articles" in data
            assert len(data["articles"]) > 0


class TestPortfolioEndpoints:
    def test_default_portfolio_unauthenticated(self, client):
        # Unauthenticated users in dev/guest mode receive demo portfolio
        res = client.get("/api/v1/portfolio")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert "portfolio_id" in data
        assert "positions" in data
        assert "allocations" in data

    def test_default_portfolio_authenticated(self, client, auth_token):
        res = client.get("/api/v1/portfolio", headers=auth_token)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert "portfolio_id" in data
        assert data["total_portfolio_value"] > 0

    def test_crud_portfolio_lifecycle(self, client, auth_token):
        # 1. Create portfolio
        create_payload = {
            "name": "Quantitative Alpha Fund",
            "description": "Multi-factor equities strategy",
            "initial_capital": 75000.0,
        }
        create_res = client.post(
            "/api/v1/portfolio", json=create_payload, headers=auth_token
        )
        assert create_res.status_code == status.HTTP_200_OK
        created = create_res.json()
        port_id = created["portfolio_id"]
        assert created["name"] == create_payload["name"]
        assert created["initial_capital"] == 75000.0
        assert created["cash"] == 75000.0
        assert len(created["positions"]) == 0

        # 2. Get portfolio details
        get_res = client.get(f"/api/v1/portfolio/{port_id}", headers=auth_token)
        assert get_res.status_code == status.HTTP_200_OK
        assert get_res.json()["portfolio_id"] == port_id

        # 3. Add position
        add_res = client.post(
            f"/api/v1/portfolio/{port_id}/positions",
            json={"symbol": "AAPL", "quantity": 50, "buy_price": 180.0},
            headers=auth_token,
        )
        assert add_res.status_code == status.HTTP_200_OK
        with_aapl = add_res.json()
        assert len(with_aapl["positions"]) == 1
        assert with_aapl["positions"][0]["symbol"] == "AAPL"
        assert with_aapl["positions"][0]["quantity"] == 50
        assert with_aapl["cash"] == 75000.0 - (50 * 180.0)

        # 4. Add second position (triggers multi-asset portfolio risk)
        add_res2 = client.post(
            f"/api/v1/portfolio/{port_id}/positions",
            json={"symbol": "MSFT", "quantity": 30, "buy_price": 400.0},
            headers=auth_token,
        )
        assert add_res2.status_code == status.HTTP_200_OK
        with_msft = add_res2.json()
        assert len(with_msft["positions"]) == 2
        assert with_msft["portfolio_risk"] is not None
        assert "portfolio_volatility_pct" in with_msft["portfolio_risk"]

        # 5. Remove partial position
        remove_res = client.delete(
            f"/api/v1/portfolio/{port_id}/positions/AAPL?quantity=20",
            headers=auth_token,
        )
        assert remove_res.status_code == status.HTTP_200_OK
        after_remove = remove_res.json()
        aapl_pos = next(p for p in after_remove["positions"] if p["symbol"] == "AAPL")
        assert aapl_pos["quantity"] == 30

        # 6. Remove remaining position completely
        remove_all = client.delete(
            f"/api/v1/portfolio/{port_id}/positions/AAPL",
            headers=auth_token,
        )
        assert remove_all.status_code == status.HTTP_200_OK
        after_remove_all = remove_all.json()
        symbols = [p["symbol"] for p in after_remove_all["positions"]]
        assert "AAPL" not in symbols


class TestWatchlistEndpoints:
    def test_get_watchlist_unauthenticated(self, client):
        res = client.get("/api/v1/watchlist")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "symbol" in data[0]
        assert "current_price" in data[0]

    def test_get_watchlist_authenticated(self, client, auth_token):
        res = client.get("/api/v1/watchlist", headers=auth_token)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert isinstance(data, list)

    def test_watchlist_add_and_delete(self, client, auth_token):
        test_sym = "GOOGL"

        # Add to watchlist
        add_res = client.post(
            "/api/v1/watchlist",
            json={"symbol": test_sym},
            headers=auth_token,
        )
        assert add_res.status_code == status.HTTP_200_OK
        added_list = add_res.json()
        assert test_sym in added_list

        # Verify in GET
        get_res = client.get("/api/v1/watchlist", headers=auth_token)
        assert get_res.status_code == status.HTTP_200_OK
        symbols = [s["symbol"] for s in get_res.json()]
        assert test_sym in symbols

        # Remove from watchlist
        del_res = client.delete(
            f"/api/v1/watchlist/{test_sym}",
            headers=auth_token,
        )
        assert del_res.status_code == status.HTTP_200_OK
        after_del = del_res.json()
        assert test_sym not in after_del

