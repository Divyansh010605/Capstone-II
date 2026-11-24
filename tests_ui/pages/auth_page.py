from selenium.webdriver.common.by import By
from .base_page import BasePage


class AuthPagePOM(BasePage):
    USERNAME_INPUT = (By.CSS_SELECTOR, '[data-testid="auth-page-username-input"]')
    PASSWORD_INPUT = (By.CSS_SELECTOR, '[data-testid="auth-page-password-input"]')
    SUBMIT_BTN = (By.CSS_SELECTOR, '[data-testid="auth-page-submit-btn"]')
    GUEST_BTN = (By.CSS_SELECTOR, '[data-testid="auth-page-guest-btn"]')
    SWITCH_REGISTER_BTN = (By.CSS_SELECTOR, '[data-testid="auth-page-switch-register-btn"]')
    SWITCH_LOGIN_BTN = (By.CSS_SELECTOR, '[data-testid="auth-page-switch-login-btn"]')
    ERROR_MSG = (By.CSS_SELECTOR, '[data-testid="auth-page-error-msg"]')

    def open(self, base_url):
        self.navigate_to(f"{base_url}/auth")
        self.wait_for_visible(self.SUBMIT_BTN)
        return self

    def enter_as_guest(self):
        self.safe_click(self.GUEST_BTN)
        self.wait_for_url_contains("/overview")
        return self

    def login(self, username="demotrader", password="demopass"):
        self.safe_type(self.USERNAME_INPUT, username)
        self.safe_type(self.PASSWORD_INPUT, password)
        self.safe_click(self.SUBMIT_BTN)
        self.wait_for_url_contains("/overview")
        return self

    def switch_to_register(self):
        self.safe_click(self.SWITCH_REGISTER_BTN)

    def switch_to_login(self):
        self.safe_click(self.SWITCH_LOGIN_BTN)

    def get_error_message(self):
        return self.get_text(self.ERROR_MSG)
