"""
Email & OTP Verification Service.
Handles OTP generation, caching, optional SMTP delivery, and dev-mode fallback.
"""

import os
import random
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger("stock_market_ai.auth.otp")

# In-memory OTP storage: email -> { "otp": str, "expires_at": datetime, "attempts": int }
_otp_cache: Dict[str, Dict[str, Any]] = {}


class EmailOTPService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("EMAILS_FROM_EMAIL", self.smtp_user or "noreply@stockmarketai.internal")
        self.otp_expiry_minutes = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))

    def generate_otp(self, length: int = 6) -> str:
        """Generate a cryptographically sound numeric OTP."""
        return "".join([str(random.SystemRandom().randint(0, 9)) for _ in range(length)])

    def _purge_expired_otps(self):
        """Purge all expired entries from _otp_cache where datetime.utcnow() > entry['expires_at']."""
        now_naive = datetime.utcnow()
        now_utc = datetime.now(timezone.utc)
        expired_emails = []
        for email, entry in list(_otp_cache.items()):
            exp = entry.get("expires_at")
            if exp:
                if (exp.tzinfo is not None and now_utc > exp) or (exp.tzinfo is None and now_naive > exp):
                    expired_emails.append(email)
        for email in expired_emails:
            _otp_cache.pop(email, None)

    async def create_and_send_otp(self, email: str, db=None) -> Tuple[bool, str, Optional[str]]:
        """
        Creates an OTP, stores it in cache & database, and dispatches via SMTP or dev logger.
        Returns: (success: bool, message: str, dev_otp: Optional[str])
        """
        self._purge_expired_otps()
        normalized_email = email.strip().lower()
        otp = self.generate_otp(6)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=self.otp_expiry_minutes)

        # Store in cache
        _otp_cache[normalized_email] = {
            "otp": otp,
            "expires_at": expires_at,
            "attempts": 0,
        }

        # Store in DB if available
        if db is not None:
            try:
                await db.password_resets.update_one(
                    {"email": normalized_email},
                    {
                        "$set": {
                            "email": normalized_email,
                            "otp": otp,
                            "expires_at": expires_at.isoformat(),
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    },
                    upsert=True,
                )
            except Exception as e:
                logger.warning(f"Failed to persist OTP to MongoDB: {e}")

        # Attempt sending via SMTP if configured
        email_sent = False
        if self.smtp_host and self.smtp_user and self.smtp_password:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = "Password Reset Verification Code - Stock Market AI"
                msg["From"] = self.from_email
                msg["To"] = normalized_email

                text_content = f"Your password reset verification code is: {otp}\nThis code will expire in {self.otp_expiry_minutes} minutes."
                html_content = f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 32px 20px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
                    <h2 style="color: #38bdf8; margin-top: 0;">Stock Market AI Security</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">We received a request to reset your password. Use the verification code below to complete your reset:</p>
                    <div style="background-color: #030712; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #0284c7;">
                        <span style="font-size: 32px; letter-spacing: 8px; font-weight: 800; color: #38bdf8; font-family: monospace;">{otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">This code will expire in {self.otp_expiry_minutes} minutes. If you did not request a password reset, please disregard this email.</p>
                </div>
                """
                msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
                email_sent = True
                logger.info(f"OTP email sent successfully via SMTP to {normalized_email}")
            except Exception as ex:
                logger.error(f"Failed to send email via SMTP to {normalized_email}: {ex}")

        # Always log to console in local/dev environments
        border = "=" * 60
        logger.info(
            f"\n{border}\n"
            f"[STOCK MARKET AI] PASSWORD RESET OTP GENERATED\n"
            f"Email: {normalized_email}\n"
            f"OTP Code: {otp}\n"
            f"Expires in: {self.otp_expiry_minutes} minutes\n"
            f"SMTP Dispatched: {email_sent}\n"
            f"{border}\n"
        )
        print(
            f"\n{border}\n"
            f">>> [AUTH SERVICE OTP CODE]: {otp} for {normalized_email}\n"
            f">>> Valid for {self.otp_expiry_minutes} minutes\n"
            f"{border}\n",
            flush=True,
        )

        # Return dev_otp if SMTP is not active so user can test immediately in UI
        dev_otp_val = None if email_sent else otp
        return True, "Verification code sent to email successfully.", dev_otp_val

    async def verify_otp(self, email: str, entered_otp: str, db=None) -> Tuple[bool, str]:
        """Verify the entered OTP against in-memory cache and MongoDB."""
        self._purge_expired_otps()
        normalized_email = email.strip().lower()
        clean_otp = entered_otp.strip()

        # Check in-memory cache first
        record = _otp_cache.get(normalized_email)
        now_utc = datetime.now(timezone.utc)

        if record:
            if now_utc > record["expires_at"]:
                _otp_cache.pop(normalized_email, None)
                return False, "Verification code has expired. Please request a new one."
            if record["otp"] == clean_otp:
                return True, "OTP verified successfully."
            record["attempts"] += 1
            if record["attempts"] > 5:
                _otp_cache.pop(normalized_email, None)
                return False, "Too many failed attempts. Please request a new verification code."
            return False, "Invalid verification code."

        # Check MongoDB fallback
        if db is not None:
            try:
                db_record = await db.password_resets.find_one({"email": normalized_email})
                if db_record:
                    exp = datetime.fromisoformat(db_record["expires_at"])
                    if now_utc > exp:
                        await db.password_resets.delete_one({"email": normalized_email})
                        return False, "Verification code has expired. Please request a new one."
                    if db_record.get("otp") == clean_otp:
                        return True, "OTP verified successfully."
                    return False, "Invalid verification code."
            except Exception as e:
                logger.warning(f"Error checking OTP in MongoDB: {e}")

        return False, "No active password reset request found for this email."

    async def clear_otp(self, email: str, db=None):
        """Invalidate OTP after successful password reset."""
        normalized_email = email.strip().lower()
        _otp_cache.pop(normalized_email, None)
        if db is not None:
            try:
                await db.password_resets.delete_one({"email": normalized_email})
            except Exception:
                pass


email_otp_service = EmailOTPService()

