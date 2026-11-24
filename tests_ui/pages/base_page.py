from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementClickInterceptedException


class BasePage:
    def __init__(self, driver, timeout=12):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(driver, timeout)

    def navigate_to(self, url):
        self.driver.get(url)

    def wait_for_visible(self, locator, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(EC.visibility_of_element_located(locator))

    def wait_for_clickable(self, locator, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(EC.element_to_be_clickable(locator))

    def wait_for_presence(self, locator, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(EC.presence_of_element_located(locator))

    def wait_for_invisibility(self, locator, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(EC.invisibility_of_element_located(locator))

    def safe_click(self, locator, timeout=None):
        el = self.wait_for_clickable(locator, timeout)
        try:
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", el)
            el.click()
        except (ElementClickInterceptedException, StaleElementReferenceException):
            self.driver.execute_script("arguments[0].click();", el)

    def safe_type(self, locator, text, clear=True, timeout=None):
        el = self.wait_for_visible(locator, timeout)
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", el)
        if clear:
            el.clear()
        el.send_keys(text)

    def get_text(self, locator, timeout=None):
        el = self.wait_for_visible(locator, timeout)
        return el.text.strip()

    def wait_for_text_to_be_present(self, locator, text, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(EC.text_to_be_present_in_element(locator, text))

    def wait_for_url_contains(self, substring, timeout=None):
        t = timeout or self.timeout
        return WebDriverWait(self.driver, t).until(EC.url_contains(substring))

    def is_element_visible(self, locator, timeout=2):
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False
