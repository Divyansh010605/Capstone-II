from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from .base_page import BasePage


class PortfolioPagePOM(BasePage):
    EXECUTE_BTN = (By.CSS_SELECTOR, '[data-testid="portfolio-page-execute-btn"]')
    SYMBOL_SELECT = (By.CSS_SELECTOR, '[data-testid="portfolio-modal-symbol"]')
    SHARES_INPUT = (By.CSS_SELECTOR, '[data-testid="portfolio-modal-shares"]')
    SUBMIT_BTN = (By.CSS_SELECTOR, '[data-testid="portfolio-modal-submit"]')

    def open_execute_modal(self):
        self.safe_click(self.EXECUTE_BTN)
        self.wait_for_visible(self.SYMBOL_SELECT)

    def buy_shares(self, symbol="AAPL", quantity=5):
        self.open_execute_modal()
        select_el = self.wait_for_visible(self.SYMBOL_SELECT)
        Select(select_el).select_by_value(symbol)
        self.safe_type(self.SHARES_INPUT, str(quantity))
        self.safe_click(self.SUBMIT_BTN)
        # Wait for row to appear
        row_locator = (By.CSS_SELECTOR, f'[data-testid="portfolio-page-position-{symbol}"]')
        self.wait_for_visible(row_locator)

    def is_position_present(self, symbol):
        locator = (By.CSS_SELECTOR, f'[data-testid="portfolio-page-position-{symbol}"]')
        return self.is_element_visible(locator, timeout=4)

    def liquidate_position(self, symbol):
        btn_locator = (By.CSS_SELECTOR, f'[data-testid="portfolio-page-liquidate-{symbol}"]')
        self.safe_click(btn_locator)
        # Accept the window.confirm confirmation dialog
        try:
            WebDriverWait(self.driver, 3).until(EC.alert_is_present())
            alert = self.driver.switch_to.alert
            alert.accept()
        except TimeoutException:
            pass
        row_locator = (By.CSS_SELECTOR, f'[data-testid="portfolio-page-position-{symbol}"]')
        self.wait_for_invisibility(row_locator)
