from selenium.webdriver.common.by import By
from .base_page import BasePage


class RiskPagePOM(BasePage):
    CATEGORY = (By.CSS_SELECTOR, '[data-testid="risk-page-category"]')
    SCORE = (By.CSS_SELECTOR, '[data-testid="risk-page-score"]')
    VOLATILITY = (By.CSS_SELECTOR, '[data-testid="risk-page-volatility"]')
    MDD = (By.CSS_SELECTOR, '[data-testid="risk-page-mdd"]')
    SHARPE = (By.CSS_SELECTOR, '[data-testid="risk-page-sharpe"]')
    SORTINO = (By.CSS_SELECTOR, '[data-testid="risk-page-sortino"]')

    def get_risk_category(self):
        return self.get_text(self.CATEGORY)

    def get_risk_score(self):
        return self.get_text(self.SCORE)

    def get_volatility(self):
        return self.get_text(self.VOLATILITY)

    def get_mdd(self):
        return self.get_text(self.MDD)

    def get_sharpe(self):
        return self.get_text(self.SHARPE)

    def get_sortino(self):
        return self.get_text(self.SORTINO)
