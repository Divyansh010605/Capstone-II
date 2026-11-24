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
        self.safe_click(self.REFRESH_BTN)
