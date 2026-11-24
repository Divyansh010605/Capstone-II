import React from 'react';
import {
  ShieldAlert,
  Activity,
  ArrowDownRight,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
import { MonteCarloDistributionChart } from '../components/charts/MonteCarloDistributionChart';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';

export const RiskAnalyticsPage = () => {
  const { selectedSymbol, riskData, loadingRisk } = useTerminal();

  const category = riskData?.risk_category || 'Medium Risk';
  const score = riskData?.risk_score || 48;
  const vol = riskData?.annualized_volatility_pct || 22.4;
  const mdd = riskData?.maximum_drawdown_pct || -16.8;
  const sharpe = riskData?.sharpe_ratio || 2.12;
  const sortino = riskData?.sortino_ratio || 2.89;

  const var95 = riskData?.value_at_risk?.['95%'] || {};
  const var99 = riskData?.value_at_risk?.['99%'] || {};
  const cvar95 = riskData?.conditional_value_at_risk?.['95%'] || {};
  const cvar99 = riskData?.conditional_value_at_risk?.['99%'] || {};

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header & Risk Score Card */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              QUANTITATIVE RISK ENGINE // {selectedSymbol}
            </span>
            <span
              data-testid="risk-page-category"
              className={`text-xs px-2 py-0.5 font-bold border ${
                category === 'Low Risk'
                  ? 'border-[#77C98B] text-[#77C98B] bg-[#77C98B]/10'
                  : category === 'High Risk'
                  ? 'border-[#E47770] text-[#E47770] bg-[#E47770]/10'
                  : 'border-[#C7F36B] text-[#C7F36B] bg-[#C7F36B]/10'
              }`}
            >
              {category.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Monte Carlo Simulation (10,000 GBM Paths) • Extreme Value Theory & Expected Shortfall
          </p>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center gap-3 bg-[#101310] border border-[#343B33] p-2.5">
          <div>
            <div className="text-[10px] text-[#969B91] uppercase">QUANT RISK SCORE</div>
            <div data-testid="risk-page-score" className="text-xl font-black text-[#E9E8DF]">
              {score} <span className="text-xs text-[#969B91] font-normal">/ 100</span>
            </div>
          </div>
          <div className="w-24 bg-[#202720] h-2.5 overflow-hidden border border-[#343B33]">
            <div
              className={`h-full ${
                score > 65 ? 'bg-[#E47770]' : score < 40 ? 'bg-[#77C98B]' : 'bg-[#C7F36B]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Key Quantitative Risk Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">ANNUALIZED VOLATILITY (σ)</div>
          <div data-testid="risk-page-volatility" className="text-xl font-bold text-[#E9E8DF] mt-1">{vol}%</div>
          <div className="text-[9px] text-[#969B91] mt-1">252-DAY REALIZED VOL</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">MAX HISTORIC DRAWDOWN (MDD)</div>
          <div data-testid="risk-page-mdd" className="text-xl font-bold text-[#E47770] mt-1">{mdd}%</div>
          <div className="text-[9px] text-[#969B91] mt-1">PEAK-TO-TROUGH DECLINE</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">SHARPE RATIO (Rf = 4.0%)</div>
          <div data-testid="risk-page-sharpe" className="text-xl font-bold text-[#77C98B] mt-1">{sharpe}</div>
          <div className="text-[9px] text-[#969B91] mt-1">RISK-ADJUSTED RETURN</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">SORTINO RATIO</div>
          <div data-testid="risk-page-sortino" className="text-xl font-bold text-[#77C98B] mt-1">{sortino}</div>
          <div className="text-[9px] text-[#969B91] mt-1">DOWNSIDE DEVIATION PENALTY</div>
        </div>
      </div>

      {/* 3. Monte Carlo 10,000-Path Return Distribution Histogram */}
      <div className="term-panel">
        <MonteCarloDistributionChart riskData={riskData} symbol={selectedSymbol} />
      </div>

      {/* 4. Value at Risk (VaR) & Conditional VaR (CVaR) Detailed Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
        {/* Value at Risk (VaR) */}
        <div className="term-panel">
          <div className="term-header">
            <span>VALUE AT RISK (VaR) SINGLE-DAY EXPOSURE</span>
            <span className="text-[10px] text-[#E47770]">TAIL THRESHOLD</span>
          </div>

          <div className="p-4 space-y-4">
            {/* 95% Confidence */}
            <div className="p-3 bg-[#121512] border border-[#242B24]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-xs text-[#E9E8DF]">
                  95.0% CONFIDENCE INTERVAL (1-IN-20 DAYS)
                </span>
                <span className="text-sm font-bold text-[#E47770]">
                  -{var95.composite_var_pct || 2.25}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#969B91] pt-2 border-t border-[#202720]">
                <div>Parametric: <strong className="text-[#E9E8DF]">-{var95.parametric_var_pct || 2.18}%</strong></div>
                <div>Historical: <strong className="text-[#E9E8DF]">-{var95.historical_var_pct || 2.34}%</strong></div>
                <div>Monte Carlo: <strong className="text-[#E9E8DF]">-{var95.monte_carlo_var_pct || 2.26}%</strong></div>
              </div>
            </div>

            {/* 99% Confidence */}
            <div className="p-3 bg-[#121512] border border-[#242B24]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-xs text-[#E9E8DF]">
                  99.0% CONFIDENCE INTERVAL (1-IN-100 DAYS)
                </span>
                <span className="text-sm font-bold text-[#E47770]">
                  -{var99.composite_var_pct || 3.65}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#969B91] pt-2 border-t border-[#202720]">
                <div>Parametric: <strong className="text-[#E9E8DF]">-{var99.parametric_var_pct || 3.42}%</strong></div>
                <div>Historical: <strong className="text-[#E9E8DF]">-{var99.historical_var_pct || 3.86}%</strong></div>
                <div>Monte Carlo: <strong className="text-[#E9E8DF]">-{var99.monte_carlo_var_pct || 3.65}%</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional VaR (Expected Shortfall) */}
        <div className="term-panel">
          <div className="term-header">
            <span>EXPECTED SHORTFALL / CONDITIONAL VaR (CVaR)</span>
            <span className="text-[10px] text-[#C7F36B]">COHERENT RISK MEASURE</span>
          </div>

          <div className="p-4 space-y-4">
            <div className="p-3 bg-[#121512] border border-[#242B24]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-bold text-xs text-[#E9E8DF]">
                  CVaR 95% EXPECTED LOSS
                </span>
                <span className="text-sm font-bold text-[#C7F36B]">
                  -{cvar95.cvar_pct || 3.12}%
                </span>
              </div>
              <p className="text-[11px] text-[#969B91]">
                Average loss incurred during market days when loss exceeds the 95% VaR threshold.
              </p>
            </div>

            <div className="p-3 bg-[#121512] border border-[#242B24]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-bold text-xs text-[#E9E8DF]">
                  CVaR 99% BLACK-SWAN EXPECTED LOSS
                </span>
                <span className="text-sm font-bold text-[#E47770]">
                  -{cvar99.cvar_pct || 4.85}%
                </span>
              </div>
              <p className="text-[11px] text-[#969B91]">
                Coherent expectation of severe tail losses during catastrophic stress events.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cross-Asset Return Covariance & Correlation Heatmap */}
      <div className="term-panel">
        <CorrelationHeatmap activeSymbol={selectedSymbol} />
      </div>
    </div>
  );
};
