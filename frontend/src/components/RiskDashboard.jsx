import React from 'react';
import {
  ShieldAlert,
  Activity,
  ArrowDownRight,
  Info,
  ShieldCheck,
  TrendingDown,
  Gauge,
  HelpCircle,
} from 'lucide-react';

export const RiskDashboard = ({ riskData, symbol }) => {
  if (!riskData) {
    return (
      <div className="glass-card p-12 text-center text-slate-400 font-mono text-sm flex flex-col items-center justify-center gap-3">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
        <span>Computing quantitative financial risk profile for {symbol}...</span>
      </div>
    );
  }

  const category = riskData.risk_category || 'Medium Risk';
  const score = riskData.risk_score || 50;

  const categoryColor =
    category === 'Low Risk'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15'
      : category === 'High Risk'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/15'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/15';

  const var95 = riskData.value_at_risk?.['95%'] || {};
  const var99 = riskData.value_at_risk?.['99%'] || {};
  const cvar95 = riskData.conditional_value_at_risk?.['95%'] || {};
  const cvar99 = riskData.conditional_value_at_risk?.['99%'] || {};

  return (
    <div className="space-y-6">
      {/* Risk Category Header Card */}
      <div className="glass-card p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Quantitative Risk Engine
                </h3>
                <span className={`text-xs px-3 py-0.5 rounded-full border font-mono font-bold tracking-wide ${categoryColor}`}>
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monte Carlo Simulation (10,000 GBM Walks) • Tail Risk & Coherent Expected Shortfall
              </p>
            </div>
          </div>

          {/* Risk Score Dial Meter */}
          <div className="flex items-center gap-4 bg-[#090d16] px-4 py-2.5 rounded-xl border border-white/10 shadow-inner self-stretch md:self-auto justify-between md:justify-start">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Risk Score</div>
              <div className="text-xl font-black font-mono text-white">{score} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
            </div>
            <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  score > 65
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : score < 40
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-cyan-400 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Core Financial Ratios */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Annualized Volatility</span>
            <div className="mt-2 text-2xl font-black font-mono text-white">
              {riskData.annualized_volatility_pct}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              252-day continuous log return σ
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Maximum Drawdown</span>
            <div className="mt-2 text-2xl font-black font-mono text-rose-400 flex items-center gap-1">
              <ArrowDownRight className="w-6 h-6" />
              {riskData.maximum_drawdown_pct}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block truncate">
              Peak: {riskData.mdd_peak_date} → Trough: {riskData.mdd_trough_date}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Sharpe Ratio</span>
            <div className="mt-2 text-2xl font-black font-mono text-cyan-400">
              {riskData.sharpe_ratio}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Risk-free benchmark: 4.0%
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Sortino Ratio</span>
            <div className="mt-2 text-2xl font-black font-mono text-purple-400">
              {riskData.sortino_ratio}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Downside volatility penalty only
            </span>
          </div>
        </div>

        {/* Narrative Description Verdict */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20 text-xs text-slate-300">
          <strong className="text-cyan-400 font-mono uppercase tracking-wider block mb-1">
            Quantitative Risk Profile Verdict
          </strong>
          {riskData.risk_description}
        </div>
      </div>

      {/* Value at Risk (VaR) & CVaR Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 95% Confidence Level */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Value at Risk (95% Daily Confidence)
            </h4>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              α = 5%
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Parametric (Variance-Covariance)</span>
              <span className="text-rose-400 font-bold">-{var95.parametric_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Historical Simulation</span>
              <span className="text-rose-400 font-bold">-{var95.historical_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Monte Carlo (10,000 GBM Walks)</span>
              <span className="text-rose-400 font-bold">-{var95.monte_carlo_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-cyan-300 font-bold">Composite 1-Day VaR (95%)</span>
              <span className="text-cyan-300 font-black text-sm">-{var95.composite_var_pct}%</span>
            </div>

            {/* Conditional VaR (Expected Shortfall) */}
            <div className="p-3.5 rounded-lg bg-[#090d16] border border-white/10 mt-3">
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span className="font-semibold text-white">Conditional VaR (Expected Shortfall)</span>
                <span className="text-rose-400 font-bold text-sm">-{cvar95.cvar_pct}%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {cvar95.description || 'Average expected tail loss when daily shock breaches the 95% threshold.'}
              </p>
            </div>
          </div>
        </div>

        {/* 99% Tail Stress Confidence Level */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Tail Stress Risk (99% Extreme Confidence)
            </h4>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              α = 1%
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Parametric Stress VaR</span>
              <span className="text-rose-400 font-bold">-{var99.parametric_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Historical Tail VaR</span>
              <span className="text-rose-400 font-bold">-{var99.historical_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] border border-white/5">
              <span className="text-slate-400">Monte Carlo Severe Shock</span>
              <span className="text-rose-400 font-bold">-{var99.monte_carlo_var_pct}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <span className="text-rose-300 font-bold">Composite Stress VaR (99%)</span>
              <span className="text-rose-300 font-black text-sm">-{var99.composite_var_pct}%</span>
            </div>

            {/* Extreme CVaR */}
            <div className="p-3.5 rounded-lg bg-[#090d16] border border-white/10 mt-3">
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span className="font-semibold text-white">Stress CVaR (99% Tail Shock)</span>
                <span className="text-rose-400 font-bold text-sm">-{cvar99.cvar_pct}%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Captures catastrophic black-swan tail losses beyond the 99th percentile boundary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions and Quantitative Methodology */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
          <Info className="w-4 h-4" />
          Quantitative Methodology & Statistical Rigor
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-[#090d16] border border-white/5">
            <strong className="text-slate-200 block mb-1">Annualization & Continuous Compounding</strong>
            All volatility calculations use 252 business days standard across US equities on continuous log-returns \(\ln(P_t / P_{t-1})\).
          </div>
          <div className="p-3 rounded-lg bg-[#090d16] border border-white/5">
            <strong className="text-slate-200 block mb-1">Coherent Risk Measures (Artzner Axioms)</strong>
            Conditional Value at Risk (Expected Shortfall) is strictly sub-additive: \(CVaR(X+Y) \le CVaR(X) + CVaR(Y)\), preventing hidden portfolio tail risks.
          </div>
        </div>
      </div>
    </div>
  );
};
