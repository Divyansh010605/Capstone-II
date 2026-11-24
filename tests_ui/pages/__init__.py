# Page Object Models for UI automation
from .base_page import BasePage
from .auth_page import AuthPagePOM
from .topbar_pom import TopBarPOM
from .sidebar_pom import SidebarPOM
from .predictions_page import PredictionsPagePOM
from .risk_page import RiskPagePOM
from .watchlist_page import WatchlistPagePOM
from .portfolio_page import PortfolioPagePOM

__all__ = [
    "BasePage",
    "AuthPagePOM",
    "TopBarPOM",
    "SidebarPOM",
    "PredictionsPagePOM",
    "RiskPagePOM",
    "WatchlistPagePOM",
    "PortfolioPagePOM",
]
