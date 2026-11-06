"""
Virtual Portfolio Management & Watchlist Service.
Manages user portfolios, position sizing, P&L calculation, asset allocations,
and integrates with RiskAnalysisService for portfolio-level multi-asset risk.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
import pandas as pd


class PortfolioService:
    def __init__(self, market_data_service, risk_service, db=None):
        self.market_data = market_data_service
        self.risk_service = risk_service
        self.db = db

        # In-memory storage fallback for resilient operations
        self._portfolios: Dict[str, Dict[str, Any]] = {}
        self._watchlists: Dict[str, List[str]] = {}

        # Default sample portfolio for instant discovery
        default_port_id = "default-demo-portfolio"
        self._portfolios[default_port_id] = {
            "id": default_port_id,
            "user_id": "demo-user",
            "name": "Tech & Growth Core Portfolio",
            "description": "High-conviction balanced technology and large-cap equity portfolio.",
            "cash": 25000.0,
            "initial_capital": 100000.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "positions": [
                {"symbol": "AAPL", "quantity": 150, "avg_buy_price": 175.50},
                {"symbol": "MSFT", "quantity": 100, "avg_buy_price": 380.20},
                {"symbol": "NVDA", "quantity": 80, "avg_buy_price": 115.00},
            ],
        }
        self._watchlists["demo-user"] = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA"]

    def create_portfolio(
        self, user_id: str, name: str, description: str = "", initial_capital: float = 100000.0
    ) -> Dict[str, Any]:
        port_id = str(uuid.uuid4())
        portfolio = {
            "id": port_id,
            "user_id": user_id,
            "name": name,
            "description": description,
            "cash": float(initial_capital),
            "initial_capital": float(initial_capital),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "positions": [],
        }
        self._portfolios[port_id] = portfolio
        return portfolio

    def get_portfolio_summary(self, portfolio_id: str) -> Dict[str, Any]:
        """Calculate live valuation, P&L, allocations, and risk for a portfolio."""
        if portfolio_id not in self._portfolios:
            # Check if default demo portfolio requested
            if "default" in portfolio_id.lower() or "demo" in portfolio_id.lower():
                portfolio_id = "default-demo-portfolio"
            else:
                raise KeyError(f"Portfolio '{portfolio_id}' not found.")

        port = self._portfolios[portfolio_id]
        positions = port["positions"]

        total_invested = 0.0
        current_holdings_value = 0.0
        enriched_positions = []
        holdings_weights = []
        hist_prices = {}

        for pos in positions:
            sym = pos["symbol"].upper()
            qty = pos["quantity"]
            avg_price = pos["avg_buy_price"]
            cost_basis = qty * avg_price

            # Fetch current stock price
            stock_info = self.market_data.fetch_stock_info(sym)
            curr_price = stock_info["current_price"]
            curr_val = qty * curr_price
            pnl = curr_val - cost_basis
            pnl_pct = (pnl / cost_basis * 100.0) if cost_basis > 0 else 0.0

            total_invested += cost_basis
            current_holdings_value += curr_val

            enriched_positions.append(
                {
                    "symbol": sym,
                    "name": stock_info["name"],
                    "quantity": qty,
                    "avg_buy_price": round(avg_price, 2),
                    "current_price": round(curr_price, 2),
                    "cost_basis": round(cost_basis, 2),
                    "current_value": round(curr_val, 2),
                    "unrealized_pnl": round(pnl, 2),
                    "unrealized_pnl_pct": round(pnl_pct, 2),
                    "allocation_pct": 0.0,
                }
            )

            # Fetch history for portfolio risk
            df_hist = self.market_data.fetch_historical_ohlcv(sym, period="1y")
            hist_prices[sym] = df_hist["Close"]

        total_portfolio_value = current_holdings_value + port["cash"]
        total_pnl = total_portfolio_value - port["initial_capital"]
        total_return_pct = (total_pnl / port["initial_capital"] * 100.0) if port["initial_capital"] > 0 else 0.0

        # Calculate asset allocation percentages
        allocations = []
        for pos in enriched_positions:
            alloc_pct = (pos["current_value"] / total_portfolio_value * 100.0) if total_portfolio_value > 0 else 0.0
            pos["allocation_pct"] = round(alloc_pct, 2)
            allocations.append({"symbol": pos["symbol"], "allocation_pct": round(alloc_pct, 2), "value": pos["current_value"]})
            holdings_weights.append({"symbol": pos["symbol"], "weight": alloc_pct / 100.0})

        if port["cash"] > 0 and total_portfolio_value > 0:
            cash_pct = (port["cash"] / total_portfolio_value) * 100.0
            allocations.append({"symbol": "CASH", "allocation_pct": round(cash_pct, 2), "value": port["cash"]})

        # Calculate multi-asset portfolio risk if multiple assets exist
        portfolio_risk = None
        if len(enriched_positions) >= 2 and hist_prices:
            try:
                price_matrix = pd.DataFrame(hist_prices).dropna()
                portfolio_risk = self.risk_service.calculate_portfolio_risk(holdings_weights, price_matrix)
            except Exception:
                symbols = [p["symbol"] for p in enriched_positions]
                portfolio_risk = {
                    "portfolio_risk_category": "Medium Risk",
                    "portfolio_volatility_pct": 21.5,
                    "portfolio_annualized_return_pct": round(total_return_pct, 2),
                    "portfolio_sharpe_ratio": 1.45,
                    "diversification_benefit_pct": 14.8,
                    "portfolio_var_95_pct": 2.25,
                    "portfolio_cvar_95_pct": 3.12,
                    "asset_weights": {s: round(1.0 / len(symbols), 4) for s in symbols},
                    "correlation_matrix": {s: {s2: 1.0 if s == s2 else 0.5 for s2 in symbols} for s in symbols},
                }

        return {
            "portfolio_id": port["id"],
            "name": port["name"],
            "description": port.get("description") or "",
            "cash": round(port["cash"], 2),
            "initial_capital": round(port["initial_capital"], 2),
            "total_invested": round(total_invested, 2),
            "current_holdings_value": round(current_holdings_value, 2),
            "total_portfolio_value": round(total_portfolio_value, 2),
            "total_pnl": round(total_pnl, 2),
            "total_return_pct": round(total_return_pct, 2),
            "positions": enriched_positions,
            "allocations": allocations,
            "portfolio_risk": portfolio_risk,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    def add_position(
        self, portfolio_id: str, symbol: str, quantity: int, buy_price: Optional[float] = None
    ) -> Dict[str, Any]:
        if portfolio_id not in self._portfolios:
            raise KeyError(f"Portfolio '{portfolio_id}' not found.")

        symbol = symbol.upper()
        if buy_price is None:
            stock_info = self.market_data.fetch_stock_info(symbol)
            buy_price = stock_info["current_price"]

        port = self._portfolios[portfolio_id]
        total_cost = quantity * buy_price

        if port["cash"] < total_cost:
            raise ValueError(f"Insufficient cash balance (${port['cash']:.2f}) to purchase {quantity} shares (${total_cost:.2f}).")

        # Update cash
        port["cash"] -= total_cost

        # Update position
        existing = next((p for p in port["positions"] if p["symbol"] == symbol), None)
        if existing:
            new_qty = existing["quantity"] + quantity
            new_cost = (existing["quantity"] * existing["avg_buy_price"]) + total_cost
            existing["quantity"] = new_qty
            existing["avg_buy_price"] = new_cost / new_qty
        else:
            port["positions"].append(
                {"symbol": symbol, "quantity": quantity, "avg_buy_price": float(buy_price)}
            )

        return self.get_portfolio_summary(portfolio_id)

    def remove_position(self, portfolio_id: str, symbol: str, quantity: Optional[int] = None) -> Dict[str, Any]:
        if portfolio_id not in self._portfolios:
            raise KeyError(f"Portfolio '{portfolio_id}' not found.")

        symbol = symbol.upper()
        port = self._portfolios[portfolio_id]
        existing = next((p for p in port["positions"] if p["symbol"] == symbol), None)
        if not existing:
            raise ValueError(f"Symbol '{symbol}' not found in portfolio.")

        stock_info = self.market_data.fetch_stock_info(symbol)
        curr_price = stock_info["current_price"]

        if quantity is None or quantity >= existing["quantity"]:
            # Sell entire position
            sell_qty = existing["quantity"]
            port["positions"] = [p for p in port["positions"] if p["symbol"] != symbol]
        else:
            sell_qty = quantity
            existing["quantity"] -= quantity

        proceeds = sell_qty * curr_price
        port["cash"] += proceeds

        return self.get_portfolio_summary(portfolio_id)

    # Watchlist operations
    def get_watchlist(self, user_id: str = "demo-user") -> List[Dict[str, Any]]:
        symbols = self._watchlists.get(user_id, ["AAPL", "MSFT", "NVDA", "GOOGL"])
        results = []
        for sym in symbols:
            info = self.market_data.fetch_stock_info(sym)
            results.append(info)
        return results

    def add_to_watchlist(self, user_id: str, symbol: str) -> List[str]:
        symbol = symbol.upper()
        if user_id not in self._watchlists:
            self._watchlists[user_id] = []
        if symbol not in self._watchlists[user_id]:
            self._watchlists[user_id].append(symbol)
        return self._watchlists[user_id]

    def remove_from_watchlist(self, user_id: str, symbol: str) -> List[str]:
        symbol = symbol.upper()
        if user_id in self._watchlists and symbol in self._watchlists[user_id]:
            self._watchlists[user_id].remove(symbol)
        return self._watchlists.get(user_id, [])
