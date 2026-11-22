"""
Authentication & JWT API Tests, including OTP Password Reset and OAuth.
"""

import uuid
from fastapi import status


def test_register_new_user(client):
    unique_id = str(uuid.uuid4())[:8]
    user_payload = {
        "email": f"trader_{unique_id}@example.com",
        "username": f"user_{unique_id}",
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!",
        "full_name": "Quantitative Trader",
    }
    response = client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == user_payload["email"]
    assert data["username"] == user_payload["username"]
    assert "hashed_password" not in data


def test_register_password_mismatch(client):
    unique_id = str(uuid.uuid4())[:8]
    user_payload = {
        "email": f"mismatch_{unique_id}@example.com",
        "username": f"mismatch_{unique_id}",
        "password": "StrongPassword123!",
        "confirm_password": "DifferentPassword456!",
    }
    response = client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Passwords do not match" in response.json()["detail"]


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


def test_forgot_password_and_reset_flow(client):
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"reset_{unique_id}@example.com"
    test_user = f"reset_{unique_id}"
    old_pwd = "OldPassword123!"
    new_pwd = "NewSecurePassword456!"

    # 1. Register user
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "username": test_user, "password": old_pwd},
    )
    assert reg_resp.status_code == status.HTTP_201_CREATED

    # 2. Request OTP for non-existent email
    bad_resp = client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert bad_resp.status_code == status.HTTP_404_NOT_FOUND

    # 3. Request OTP for existing user
    fp_resp = client.post("/api/v1/auth/forgot-password", json={"email": test_email})
    assert fp_resp.status_code == status.HTTP_200_OK
    fp_data = fp_resp.json()
    assert fp_data["success"] is True
    otp = fp_data.get("dev_otp")
    assert otp is not None
    assert len(otp) == 6

    # 4. Verify invalid OTP
    bad_otp_resp = client.post("/api/v1/auth/verify-otp", json={"email": test_email, "otp": "000000"})
    assert bad_otp_resp.status_code == status.HTTP_400_BAD_REQUEST

    # 5. Verify valid OTP
    good_otp_resp = client.post("/api/v1/auth/verify-otp", json={"email": test_email, "otp": otp})
    assert good_otp_resp.status_code == status.HTTP_200_OK

    # 6. Reset password with mismatching confirmation
    mismatch_reset = client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": test_email,
            "otp": otp,
            "new_password": new_pwd,
            "confirm_password": "MismatchPassword!",
        },
    )
    assert mismatch_reset.status_code == status.HTTP_400_BAD_REQUEST

    # 7. Reset password successfully
    reset_resp = client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": test_email,
            "otp": otp,
            "new_password": new_pwd,
            "confirm_password": new_pwd,
        },
    )
    assert reset_resp.status_code == status.HTTP_200_OK
    assert reset_resp.json()["success"] is True

    # 8. Verify old password no longer works
    fail_login = client.post(
        "/api/v1/auth/login",
        json={"username": test_user, "password": old_pwd},
    )
    assert fail_login.status_code == status.HTTP_401_UNAUTHORIZED

    # 9. Verify new password logs in successfully
    success_login = client.post(
        "/api/v1/auth/login",
        json={"username": test_user, "password": new_pwd},
    )
    assert success_login.status_code == status.HTTP_200_OK
    assert "access_token" in success_login.json()


def test_oauth_login_google_and_github(client):
    # Google OAuth
    google_resp = client.post(
        "/api/v1/auth/oauth/google",
        json={
            "provider": "google",
            "email": "alex.trader@gmail.com",
            "name": "Alex Trader",
            "username": "alextrader",
        },
    )
    assert google_resp.status_code == status.HTTP_200_OK
    g_data = google_resp.json()
    assert "access_token" in g_data
    assert g_data["user"]["email"] == "alex.trader@gmail.com"

    # GitHub OAuth
    github_resp = client.post(
        "/api/v1/auth/oauth/github",
        json={
            "provider": "github",
            "email": "dev.trader@github.com",
            "name": "GitHub Dev",
            "username": "devtrader",
        },
    )
    assert github_resp.status_code == status.HTTP_200_OK
    gh_data = github_resp.json()
    assert "access_token" in gh_data
    assert gh_data["user"]["email"] == "dev.trader@github.com"
