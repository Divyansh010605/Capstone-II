"""
Authentication & JWT API Tests.
"""

import uuid
from fastapi import status


def test_register_new_user(client):
    unique_id = str(uuid.uuid4())[:8]
    user_payload = {
        "email": f"trader_{unique_id}@example.com",
        "username": f"user_{unique_id}",
        "password": "StrongPassword123!",
        "full_name": "Quantitative Trader",
    }
    response = client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == user_payload["email"]
    assert data["username"] == user_payload["username"]
    assert "hashed_password" not in data


def test_login_success(client):
    unique_id = str(uuid.uuid4())[:8]
    user_payload = {
        "email": f"login_{unique_id}@example.com",
        "username": f"login_{unique_id}",
        "password": "MySecretPassword456!",
    }
    client.post("/api/v1/auth/register", json=user_payload)

    # Login with form data
    response = client.post(
        "/api/v1/auth/login",
        data={"username": user_payload["username"], "password": "MySecretPassword456!"},
    )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["username"] == user_payload["username"]


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "demotrader", "password": "WrongPassword!"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_profile(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "email" in data
    assert "username" in data
