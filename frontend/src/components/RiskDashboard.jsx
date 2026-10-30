import React from 'react';
import { ShieldAlert, Activity, ArrowDownRight, Info, HelpCircle } from 'lucide-react';

export const RiskDashboard = ({ riskData, symbol }) => {
  if (!riskData) {
    return (
      <div className="glass-card p-8 text-center text-slate-400 font-mono text-sm">
        Loading financial risk metrics for {symbol}...
      </div>
    );
  }

  const category = riskData.risk_category || 'Medium Risk';
  const score = riskData.risk_score || 50;

  const categoryColor =
    category === 'Low Risk'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : category === 'High Risk'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  const var95 = riskData.value_at_risk?.['95%'] || {};
  const var99 = riskData.value_at_risk?.['99%'] || {};
  const cvar95 = riskData.conditional_value_at_risk?.['95%'] || {};
  const cvar99 = riskData.conditional_value_at_risk?.['99%'] || {};

  return (
    <div className="space-y-6">
      {/* Risk Category Header Card */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Quantitative Financial Risk Profiler
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${categoryColor}`}>
                  {category}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-Methodology Value at Risk, Downside Deviation & Tail Risk Assessment
              </p>
            </div>
          </div>

          {/* Risk Score Dial Meter */}
          <div className="flex items-center gap-3 bg-[#090d16] px-4 py-2 rounded-xl border border-white/10">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">RISK FACTOR</div>
              <div className="text-lg font-bold font-mono text-white">{score} / 100</div>
            </div>
            <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score > 70 ? 'bg-rose-500' : score < 40 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Core Financial Ratios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Annualized Volatility</span>
            <div className="mt-1 text-xl font-bold font-mono text-white">
              {riskData.annualized_volatility_pct}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">252-day log return σ</span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Maximum Drawdown</span>
            <div className="mt-1 text-xl font-bold font-mono text-rose-400 flex items-center gap-1">
              <ArrowDownRight className="w-5 h-5" />
              {riskData.maximum_drawdown_pct}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Peak: {riskData.mdd_peak_date} → {riskData.mdd_trough_date}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Sharpe Ratio</span>
            <div className="mt-1 text-xl font-bold font-mono text-blue-400">
              {riskData.sharpe_ratio}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Rf benchmark: 4.0%</span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Sortino Ratio</span>
            <div className="mt-1 text-xl font-bold font-mono text-purple-400">
              {riskData.sortino_ratio}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Downside deviation only</span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300">
          <strong className="text-white">Profile Verdict: </strong>
          {riskData.risk_description}
        </div>
      </div>

      {/* Value at Risk (VaR) & CVaR Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 95% Confidence Level */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Value at Risk (95% Daily Confidence)
            </h4>
            <span className="text-xs font-mono text-blue-400">α = 5%</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Parametric (Variance-Covariance)</span>
              <span className="text-rose-400 font-bold">-{var95.parametric_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Historical Simulation</span>
              <span className="text-rose-400 font-bold">-{var95.historical_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Monte Carlo (10,000 GBM Walks)</span>
              <span className="text-rose-400 font-bold">-{var95.monte_carlo_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-blue-500/10 border border-blue-500/20">
              <span className="text-blue-300 font-semibold">Composite Daily VaR (95%)</span>
              <span className="text-blue-300 font-bold">-{var95.composite_var_pct}%</span>
            </div>

            {/* Conditional VaR */}
            <div className="p-3 rounded bg-[#090d16] border border-white/5 mt-3">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Conditional VaR (Expected Shortfall)</span>
                <span className="text-rose-400 font-bold">-{cvar95.cvar_pct}%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                {cvar95.description || 'Average expected loss when tail shock breaches 95% threshold.'}
              </p>
            </div>
          </div>
        </div>

        {/* 99% Stress Confidence Level */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Tail Stress Risk (99% Extreme Confidence)
            </h4>
            <span className="text-xs font-mono text-rose-400">α = 1%</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Parametric Stress VaR</span>
              <span className="text-rose-400 font-bold">-{var99.parametric_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Historical Tail VaR</span>
              <span className="text-rose-400 font-bold">-{var99.historical_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Monte Carlo Severe Shock</span>
              <span className="text-rose-400 font-bold">-{var99.monte_carlo_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-300 font-semibold">Composite Stress VaR (99%)</span>
              <span className="text-rose-300 font-bold">-{var99.composite_var_pct}%</span>
            </div>

            {/* Extreme CVaR */}
            <div className="p-3 rounded bg-[#090d16] border border-white/5 mt-3">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Stress CVaR (99% Tail Shock)</span>
                <span className="text-rose-400 font-bold">-{cvar99.cvar_pct}%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Captures systemic black-swan tail losses beyond the 99th percentile boundary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions and Methodology Notes */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1.5 mb-2">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          QUANTITATIVE METHODOLOGY & STATISTICAL ASSUMPTIONS
        </h4>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Annualization factor: 252 business days standard across US equities.</li>
          <li>Risk-free benchmark yield set to 4.0% annualized (US 10-Year Treasury Yield parity).</li>
          <li>Monte Carlo engine executes 10,000 Geometric Brownian Motion (GBM) paths with antithetic variance reduction.</li>
          <li>Conditional Value at Risk (Expected Shortfall) is strictly coherent (satisfies sub-additivity) unlike raw VaR.</li>
        </ul>
      </div>
    </div>
  );
};
