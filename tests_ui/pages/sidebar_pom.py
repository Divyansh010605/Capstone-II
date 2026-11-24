from selenium.webdriver.common.by import By
from .base_page import BasePage


class SidebarPOM(BasePage):
    def get_nav_locator(self, section):
        return (By.CSS_SELECTOR, f'[data-testid="sidebar-nav-{section}"]')

    def navigate_to(self, section):
        locator = self.get_nav_locator(section)
        self.safe_click(locator)
        self.wait_for_url_contains(f"/{section}")

    def is_nav_visible(self, section):
        return self.is_element_visible(self.get_nav_locator(section), timeout=3)
