"""
Virtual Portfolio & Watchlist API Tests.
"""

from fastapi import status


def test_create_and_query_portfolio(client, auth_headers):
    # 1. Create portfolio
    payload = {
        "name": "Retirement Growth Fund",
        "description": "Long-term ETF & tech allocation",
        "initial_capital": 50000.0,
    }
    create_resp = client.post("/api/v1/portfolio", json=payload, headers=auth_headers)
    assert create_resp.status_code == status.HTTP_200_OK
    port = create_resp.json()
    assert port["name"] == payload["name"]
    assert port["initial_capital"] == 50000.0
    port_id = port["portfolio_id"]

    # 2. Add position
    add_resp = client.post(
        f"/api/v1/portfolio/{port_id}/positions",
        json={"symbol": "AAPL", "quantity": 20, "buy_price": 150.0},
        headers=auth_headers,
    )
    assert add_resp.status_code == status.HTTP_200_OK
    updated_port = add_resp.json()
    assert len(updated_port["positions"]) == 1
    assert updated_port["positions"][0]["symbol"] == "AAPL"
    assert updated_port["positions"][0]["quantity"] == 20

    # 3. Retrieve portfolio
    get_resp = client.get(f"/api/v1/portfolio/{port_id}", headers=auth_headers)
    assert get_resp.status_code == status.HTTP_200_OK
    assert get_resp.json()["portfolio_id"] == port_id

    # 4. Remove position
    del_resp = client.delete(
        f"/api/v1/portfolio/{port_id}/positions/AAPL?quantity=10",
        headers=auth_headers,
    )
    assert del_resp.status_code == status.HTTP_200_OK
    after_del = del_resp.json()
    assert after_del["positions"][0]["quantity"] == 10


def test_watchlist_operations(client, auth_headers):
    # Add to watchlist
    add_resp = client.post(
        "/api/v1/watchlist", json={"symbol": "NVDA"}, headers=auth_headers
    )
    assert add_resp.status_code == status.HTTP_200_OK
    assert "NVDA" in add_resp.json()

    # Get watchlist
    list_resp = client.get("/api/v1/watchlist", headers=auth_headers)
    assert list_resp.status_code == status.HTTP_200_OK
    symbols = [item["symbol"] for item in list_resp.json()]
    assert "NVDA" in symbols

    # Remove from watchlist
    del_resp = client.delete("/api/v1/watchlist/NVDA", headers=auth_headers)
    assert del_resp.status_code == status.HTTP_200_OK
    assert "NVDA" not in del_resp.json()
