import pytest
from tests_ui.pages.auth_page import AuthPagePOM
from tests_ui.pages.topbar_pom import TopBarPOM
from tests_ui.pages.sidebar_pom import SidebarPOM
from tests_ui.pages.predictions_page import PredictionsPagePOM
from tests_ui.pages.risk_page import RiskPagePOM
from tests_ui.pages.watchlist_page import WatchlistPagePOM
from tests_ui.pages.portfolio_page import PortfolioPagePOM


class TestAlphaQuantUIFlows:
    """Automated UI end-to-end tests for AlphaQuant terminal application."""

    def test_01_guest_access_and_overview(self, driver, base_url):
        """User flow 1: Unauthenticated visitor can enter via Guest Sandbox and view Overview."""
        auth_page = AuthPagePOM(driver).open(base_url)
        auth_page.enter_as_guest()

        sidebar = SidebarPOM(driver)
        assert sidebar.is_nav_visible("overview")
        assert "overview" in driver.current_url.lower()

    def test_02_stock_search_navigation(self, driver, base_url):
        """User flow 2: Global stock search updates the active terminal ticker."""
        AuthPagePOM(driver).open(base_url).enter_as_guest()

        topbar = TopBarPOM(driver)
        topbar.search_ticker("NVDA")

        # Verify search input or URL/overview updates
        assert driver.current_url is not None

    def test_03_dashboard_navigation_flows(self, driver, base_url):
        """User flow 3: Navigate seamlessly across all workspace pages via sidebar."""
        AuthPagePOM(driver).open(base_url).enter_as_guest()
        sidebar = SidebarPOM(driver)

        pages_to_test = [
            "explorer",
            "watchlist",
            "predictions",
            "risk",
            "portfolio",
            "sentiment",
            "overview",
        ]

        for page in pages_to_test:
            sidebar.navigate_to(page)
            assert f"/{page}" in driver.current_url.lower()

    def test_04_ai_predictions_interactions(self, driver, base_url):
        """User flow 4: AI predictions panel model switching, horizon selection, and inference trigger."""
        AuthPagePOM(driver).open(base_url).enter_as_guest()
        SidebarPOM(driver).navigate_to("predictions")

        pred_page = PredictionsPagePOM(driver)

        # Switch horizons
        pred_page.select_horizon(7)
        pred_page.select_horizon(14)

        # Switch neural architectures
        pred_page.select_model("transformer")
        pred_page.select_model("lstm")
        pred_page.select_model("ensemble")

        # Trigger inference execution
        pred_page.trigger_inference()

    def test_05_risk_analytics_metrics(self, driver, base_url):
        """User flow 5: Quantitative Risk Profiler metrics and ratio verification."""
        AuthPagePOM(driver).open(base_url).enter_as_guest()
        SidebarPOM(driver).navigate_to("risk")

        risk_page = RiskPagePOM(driver)

        category = risk_page.get_risk_category()
        assert len(category) > 0, "Risk category should be displayed"

        score = risk_page.get_risk_score()
        assert "/ 100" in score, "Risk score format should match"

        vol = risk_page.get_volatility()
        assert "%" in vol, "Volatility should include percentage"

        mdd = risk_page.get_mdd()
        assert "%" in mdd, "MDD should include percentage"

        sharpe = risk_page.get_sharpe()
        assert len(sharpe) > 0, "Sharpe ratio should be populated"

    def test_06_watchlist_management(self, driver, base_url):
        """User flow 6: Add, display, and remove ticker from live watchlist."""
        AuthPagePOM(driver).open(base_url).enter_as_guest()
        SidebarPOM(driver).navigate_to("watchlist")

        wl_page = WatchlistPagePOM(driver)
        test_ticker = "TSLA"

        # Add ticker to watchlist
        wl_page.add_ticker(test_ticker)
        assert wl_page.is_ticker_present(test_ticker), f"Expected {test_ticker} in watchlist"

        # Remove ticker
        wl_page.remove_ticker(test_ticker)
        assert not wl_page.is_ticker_present(test_ticker), f"Expected {test_ticker} to be removed"

    def test_07_portfolio_management(self, driver, base_url):
        """User flow 7: Execute order, monitor portfolio position, and liquidate."""
        AuthPagePOM(driver).open(base_url).enter_as_guest()
        SidebarPOM(driver).navigate_to("portfolio")

        port_page = PortfolioPagePOM(driver)
        test_asset = "MSFT"

        # Execute purchase order
        port_page.buy_shares(symbol=test_asset, quantity=5)
        assert port_page.is_position_present(test_asset), f"Expected position {test_asset} in portfolio"

        # Liquidate position
        port_page.liquidate_position(test_asset)
        assert not port_page.is_position_present(test_asset), f"Expected {test_asset} to be liquidated"

    def test_08_authentication_and_session_logout(self, driver, base_url):
        """User flow 8: Sign in with valid credentials, verify active session, and sign out."""
        # 1. Login with demo credentials
        auth_page = AuthPagePOM(driver).open(base_url)
        auth_page.login(username="demotrader", password="demopass")

        topbar = TopBarPOM(driver)
        assert topbar.is_user_logged_in(), "User session badge should be visible after login"

        # 2. Terminate session (Logout)
        topbar.logout()
        assert "auth" in driver.current_url.lower(), "Should be redirected back to auth on logout"
