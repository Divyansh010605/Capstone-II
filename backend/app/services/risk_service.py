"""
Comprehensive Financial Risk Analysis Service.
Implements:
- Annualized Historical Volatility
- Value at Risk (Parametric, Historical Simulation, Monte Carlo Geometric Brownian Motion)
- Conditional Value at Risk (CVaR / Expected Shortfall)
- Maximum Drawdown (MDD with peak-to-trough analysis)
- Sharpe Ratio & Sortino Ratio
- Portfolio-level multi-asset risk aggregation (Covariance, Diversification benefit)
- Risk Categorization (Low, Medium, High) with documented financial assumptions.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy import stats


class RiskAnalysisService:
    def __init__(self, risk_free_rate: float = 0.04):
        """
        risk_free_rate: Annualized risk-free benchmark yield (e.g. 4.0% US 10-Yr Treasury).
        """
        self.risk_free_rate = risk_free_rate
        self.trading_days_per_year = 252

    def calculate_stock_risk(
        self,
        symbol: str,
        prices: pd.Series,
        confidence_levels: List[float] = [0.95, 0.99],
        mc_simulations: int = 10000,
    ) -> Dict[str, Any]:
        """
        Calculate extensive risk metrics for a single stock price series.
        """
        if len(prices) < 30:
            raise ValueError(f"At least 30 trading days of price data are required for risk analysis. Got {len(prices)}.")

        # Clean series
        clean_prices = prices.dropna().astype(float)
        daily_returns = clean_prices.pct_change().dropna()
        log_returns = np.log(clean_prices / clean_prices.shift(1)).dropna()

        # 1. Historical Volatility (Annualized)
        daily_std = float(log_returns.std())
        annualized_volatility = float(daily_std * np.sqrt(self.trading_days_per_year))

        # Annualized return
        daily_mean = float(log_returns.mean())
        annualized_return = float(daily_mean * self.trading_days_per_year)

        # 2. Maximum Drawdown (Peak to Trough)
        cumulative_prices = clean_prices
        rolling_max = cumulative_prices.cummax()
        drawdown_series = (cumulative_prices - rolling_max) / rolling_max
        max_drawdown = float(drawdown_series.min())

        trough_idx = drawdown_series.idxmin()
        peak_idx = cumulative_prices.loc[:trough_idx].idxmax()

        peak_date = str(peak_idx)[:10] if hasattr(peak_idx, "strftime") else str(peak_idx)
        trough_date = str(trough_idx)[:10] if hasattr(trough_idx, "strftime") else str(trough_idx)

        # 3. Value at Risk (VaR) & Conditional VaR (CVaR)
        var_metrics = {}
        cvar_metrics = {}

        for cl in confidence_levels:
            cl_key = f"{int(cl * 100)}%"
            alpha = 1.0 - cl

            # A. Parametric (Variance-Covariance) VaR
            z_score = stats.norm.ppf(1.0 - alpha)
            param_var = -(daily_mean - z_score * daily_std)

            # B. Historical Simulation VaR
            hist_var = -float(np.percentile(daily_returns, alpha * 100))

            # C. Monte Carlo VaR (Geometric Brownian Motion)
            current_p = float(clean_prices.iloc[-1])
            dt = 1.0 / self.trading_days_per_year
            # Vectorized GBM random walks for 1-day horizon
            rand_shocks = np.random.normal(0, 1, mc_simulations)
            sim_prices = current_p * np.exp((daily_mean - 0.5 * (daily_std ** 2)) * 1.0 + daily_std * np.sqrt(1.0) * rand_shocks)
            sim_returns = (sim_prices - current_p) / current_p
            mc_var = -float(np.percentile(sim_returns, alpha * 100))

            var_metrics[cl_key] = {
                "parametric_var_pct": round(param_var * 100.0, 3),
                "historical_var_pct": round(hist_var * 100.0, 3),
                "monte_carlo_var_pct": round(mc_var * 100.0, 3),
                "composite_var_pct": round(np.mean([param_var, hist_var, mc_var]) * 100.0, 3),
            }

            # D. Conditional VaR (CVaR / Expected Shortfall)
            tail_returns = daily_returns[daily_returns <= -hist_var]
            if len(tail_returns) > 0:
                cvar_val = -float(tail_returns.mean())
            else:
                cvar_val = hist_var * 1.25

            cvar_metrics[cl_key] = {
                "cvar_pct": round(cvar_val * 100.0, 3),
                "description": f"Expected average loss when daily losses exceed the {cl_key} VaR threshold.",
            }

        # 4. Sharpe Ratio
        excess_return = annualized_return - self.risk_free_rate
        sharpe_ratio = float(excess_return / (annualized_volatility + 1e-9))

        # 5. Sortino Ratio (Downside deviation only)
        downside_returns = daily_returns[daily_returns < 0]
        if len(downside_returns) > 0:
            downside_std = float(downside_returns.std() * np.sqrt(self.trading_days_per_year))
            sortino_ratio = float(excess_return / (downside_std + 1e-9))
        else:
            sortino_ratio = sharpe_ratio * 1.5

        # 6. Risk Level Categorization
        composite_95_var = var_metrics["95%"]["composite_var_pct"]
        vol_pct = annualized_volatility * 100.0
        mdd_pct = abs(max_drawdown * 100.0)

        if vol_pct < 20.0 and mdd_pct < 15.0 and composite_95_var < 2.5:
            risk_category = "Low Risk"
            risk_score = 30
            risk_description = "Conservative asset profile with low volatility and defensive drawdowns."
        elif vol_pct > 35.0 or mdd_pct > 32.0 or composite_95_var > 4.5:
            risk_category = "High Risk"
            risk_score = 85
            risk_description = "High beta asset experiencing pronounced tail risks, deep drawdowns, or aggressive volatility."
        else:
            risk_category = "Medium Risk"
            risk_score = 55
            risk_description = "Balanced risk-return profile typical of large-cap growth or broad equity indices."

        return {
            "symbol": symbol.upper(),
            "risk_category": risk_category,
            "risk_score": risk_score,
            "risk_description": risk_description,
            "annualized_volatility_pct": round(vol_pct, 2),
            "annualized_return_pct": round(annualized_return * 100.0, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "sortino_ratio": round(sortino_ratio, 2),
            "maximum_drawdown_pct": round(max_drawdown * 100.0, 2),
            "mdd_peak_date": peak_date,
            "mdd_trough_date": trough_date,
            "value_at_risk": var_metrics,
            "conditional_value_at_risk": cvar_metrics,
            "methodology_notes": {
                "assumptions": [
                    "Trading year standardized to 252 business days.",
                    f"Risk-free rate assumed at {self.risk_free_rate * 100:.1f}%.",
                    "Monte Carlo assumes Geometric Brownian Motion (GBM) with log-normal returns.",
                    "CVaR represents tail conditional expectation beyond the VaR threshold.",
                ]
            },
        }

    def calculate_portfolio_risk(
        self, holdings: List[Dict[str, Any]], price_history_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Evaluate multi-asset portfolio risk.
        holdings: [{'symbol': 'AAPL', 'weight': 0.6}, {'symbol': 'MSFT', 'weight': 0.4}]
        price_history_df: DataFrame with Close prices of each symbol as columns.
        """
        symbols = [h["symbol"].upper() for h in holdings if h["symbol"].upper() in price_history_df.columns]
        if not symbols:
            raise ValueError("None of the portfolio symbols were found in historical price matrix.")

        # Normalize weights
        raw_weights = {h["symbol"].upper(): float(h["weight"]) for h in holdings}
        total_w = sum(raw_weights[s] for s in symbols)
        weights_vec = np.array([raw_weights[s] / total_w for s in symbols], dtype=float)

        sub_df = price_history_df[symbols].dropna()
        daily_returns = sub_df.pct_change().dropna()

        # Covariance matrix (annualized)
        cov_matrix = daily_returns.cov() * self.trading_days_per_year
        corr_matrix = daily_returns.corr()

        # Portfolio annualized variance & volatility
        portfolio_variance = float(np.dot(weights_vec.T, np.dot(cov_matrix.values, weights_vec)))
        portfolio_volatility = float(np.sqrt(max(portfolio_variance, 0.0)))

        # Individual volatilities
        individual_vols = daily_returns.std() * np.sqrt(self.trading_days_per_year)
        weighted_avg_vol = float(np.sum(weights_vec * individual_vols.values))

        # Diversification Benefit (Ratio)
        diversification_benefit_pct = float(
            max(0.0, (1.0 - (portfolio_volatility / (weighted_avg_vol + 1e-9)))) * 100.0
        )

        # Portfolio historical returns
        portfolio_daily_return = daily_returns.dot(weights_vec)
        annualized_port_return = float(portfolio_daily_return.mean() * self.trading_days_per_year)

        # Portfolio Sharpe
        excess = annualized_port_return - self.risk_free_rate
        portfolio_sharpe = float(excess / (portfolio_volatility + 1e-9))

        # Portfolio VaR 95%
        port_var_95 = float(-np.percentile(portfolio_daily_return, 5.0) * 100.0)
        port_cvar_95 = float(-portfolio_daily_return[portfolio_daily_return <= -port_var_95 / 100.0].mean() * 100.0)

        # Risk Category
        vol_pct = portfolio_volatility * 100.0
        if vol_pct < 18.0:
            category = "Low Risk"
        elif vol_pct > 30.0:
            category = "High Risk"
        else:
            category = "Medium Risk"

        return {
            "portfolio_risk_category": category,
            "portfolio_volatility_pct": round(vol_pct, 2),
            "portfolio_annualized_return_pct": round(annualized_port_return * 100.0, 2),
            "portfolio_sharpe_ratio": round(portfolio_sharpe, 2),
            "diversification_benefit_pct": round(diversification_benefit_pct, 2),
            "portfolio_var_95_pct": round(port_var_95, 2),
            "portfolio_cvar_95_pct": round(port_cvar_95, 2),
            "asset_weights": {s: round(float(w), 4) for s, w in zip(symbols, weights_vec)},
            "correlation_matrix": {s: corr_matrix[s].round(3).to_dict() for s in symbols},
        }
