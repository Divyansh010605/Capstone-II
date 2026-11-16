"""
Pytest configuration and test fixtures.
"""

import os
import sys
from pathlib import Path
import pytest
import httpx

# Compatibility patch for Starlette TestClient with httpx >= 0.28.0
_orig_httpx_client_init = httpx.Client.__init__

def _patched_httpx_client_init(self, *args, **kwargs):
    if "app" in kwargs:
        app = kwargs.pop("app")
        if "transport" not in kwargs or kwargs["transport"] is None:
            kwargs["transport"] = httpx.ASGITransport(app=app)
    _orig_httpx_client_init(self, *args, **kwargs)

httpx.Client.__init__ = _patched_httpx_client_init

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
