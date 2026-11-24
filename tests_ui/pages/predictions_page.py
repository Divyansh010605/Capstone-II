from selenium.webdriver.common.by import By
from .base_page import BasePage


class PredictionsPagePOM(BasePage):
    REFRESH_BTN = (By.CSS_SELECTOR, '[data-testid="predictions-page-refresh-btn"]')

    def select_horizon(self, days):
        locator = (By.CSS_SELECTOR, f'[data-testid="predictions-page-horizon-{days}"]')
        self.safe_click(locator)

    def select_model(self, model_id):
        locator = (By.CSS_SELECTOR, f'[data-testid="predictions-page-model-{model_id}"]')
        self.safe_click(locator)

    def trigger_inference(self):
        try:
            self.wait_for_clickable(self.REFRESH_BTN, timeout=10)
            self.safe_click(self.REFRESH_BTN)
        except Exception:
            el = self.wait_for_presence(self.REFRESH_BTN)
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click();", el)
