"""
Pytest configuration and test fixtures.
"""

import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure root workspace is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def auth_headers(client):
    """Authenticate and obtain Bearer token headers for protected requests."""
    # Register test user
    test_user = {
        "email": "testtrader@example.com",
        "username": "testtrader",
        "password": "Password123!",
        "full_name": "Test Trader",
    }
    client.post("/api/v1/auth/register", json=test_user)

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "testtrader", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
