from selenium.webdriver.common.by import By
from .base_page import BasePage


class WatchlistPagePOM(BasePage):
    INPUT = (By.CSS_SELECTOR, '[data-testid="watchlist-page-input"]')
    ADD_BTN = (By.CSS_SELECTOR, '[data-testid="watchlist-page-add-btn"]')

    def add_ticker(self, symbol):
        self.safe_type(self.INPUT, symbol)
        self.safe_click(self.ADD_BTN)
        # Wait until the item appears in the table
        locator = (By.CSS_SELECTOR, f'[data-testid="watchlist-page-item-{symbol}"]')
        self.wait_for_visible(locator)

    def is_ticker_present(self, symbol):
        locator = (By.CSS_SELECTOR, f'[data-testid="watchlist-page-item-{symbol}"]')
        return self.is_element_visible(locator, timeout=4)

    def remove_ticker(self, symbol):
        locator = (By.CSS_SELECTOR, f'[data-testid="watchlist-page-remove-{symbol}"]')
        self.safe_click(locator)
        # Wait until element is removed
        row_locator = (By.CSS_SELECTOR, f'[data-testid="watchlist-page-item-{symbol}"]')
        self.wait_for_invisibility(row_locator)
