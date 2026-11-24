from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from .base_page import BasePage


class TopBarPOM(BasePage):
    SEARCH_INPUT = (By.CSS_SELECTOR, '[data-testid="topbar-search-input"]')
    USER_BADGE = (By.CSS_SELECTOR, '[data-testid="topbar-user-badge"]')
    LOGOUT_BTN = (By.CSS_SELECTOR, '[data-testid="topbar-logout-btn"]')
    SIGNIN_BTN = (By.CSS_SELECTOR, '[data-testid="topbar-signin-btn"]')

    def search_ticker(self, symbol):
        el = self.wait_for_visible(self.SEARCH_INPUT)
        el.click()
        el.clear()
        el.send_keys(symbol)
        el.send_keys(Keys.ENTER)

    def get_user_badge_text(self):
        return self.get_text(self.USER_BADGE)

    def is_user_logged_in(self):
        return self.is_element_visible(self.USER_BADGE, timeout=3)

    def logout(self):
        self.safe_click(self.LOGOUT_BTN)
        self.wait_for_url_contains("/auth")
