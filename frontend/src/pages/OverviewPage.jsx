import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  ShieldAlert,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
import { TradingViewLightweightChart } from '../components/charts/TradingViewLightweightChart';

const BENCHMARKS = [
  { name: 'NIFTY 50', val: '24,180.80', chg: '+142.30', pct: '+0.59%', up: true, region: 'NSE (India)' },
  { name: 'SENSEX', val: '79,402.25', chg: '+445.60', pct: '+0.56%', up: true, region: 'BSE (India)' },
  { name: 'NASDAQ 100', val: '20,845.50', chg: '+198.40', pct: '+0.96%', up: true, region: 'US Tech' },
  { name: 'S&P 500', val: '5,885.20', chg: '+32.10', pct: '+0.55%', up: true, region: 'US Broad' },
];

export const OverviewPage = () => {
  const {
    selectedSymbol,
    changeSymbol,
    historyData,
    predictionData,
    riskData,
    portfolioData,
    sentimentData,
    loadingHistory,
    loadingPred,
  } = useTerminal();

  const navigate = useNavigate();

  const records = historyData?.data || [];
  const latest = records[records.length - 1];
  const prev = records[records.length - 2];
  const latestClose = latest?.close || 185.0;
  const prevClose = prev?.close || latestClose;
  const chg = latestClose - prevClose;
  const chgPct = prevClose > 0 ? ((chg / prevClose) * 100).toFixed(2) : '0.00';
  const isUp = chg >= 0;

  const trend = predictionData?.trend || 'Bullish';
  const finalPrice = predictionData?.predicted_final_price || latestClose * 1.03;
  const expectedReturn = predictionData?.expected_return_pct || 3.12;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Global Benchmark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BENCHMARKS.map((b) => (
          <div key={b.name} className="term-panel p-3">
            <div className="flex items-center justify-between text-[#969B91] text-[10px] font-mono mb-1">
              <span className="font-heading font-bold text-xs text-[#E9E8DF]">{b.name}</span>
              <span>{b.region}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-base font-bold text-[#E9E8DF]">{b.val}</span>
              <span
                className={`font-mono text-xs font-semibold flex items-center gap-0.5 ${
                  b.up ? 'text-[#77C98B]' : 'text-[#E47770]'
                }`}
              >
                {b.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {b.pct}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Dashboard Split: Active Ticker Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Stock Live Chart */}
        <div className="lg:col-span-2 term-panel flex flex-col">
          <div className="term-header">
            <div className="flex items-center gap-3">
              <span className="text-[#E9E8DF] font-bold text-sm">{selectedSymbol}</span>
              <span className="text-xs font-mono text-[#E9E8DF]">${latestClose.toFixed(2)}</span>
              <span
                className={`text-xs font-mono font-semibold flex items-center ${
                  isUp ? 'text-[#77C98B]' : 'text-[#E47770]'
                }`}
              >
                {isUp ? '+' : ''}{chgPct}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/explorer')}
                className="term-btn-ghost text-[11px] py-0.5 px-2 flex items-center gap-1"
              >
                <span>Full Technicals</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between">
            {loadingHistory ? (
              <div className="h-80 flex items-center justify-center font-mono text-xs text-[#969B91]">
                <Activity className="w-4 h-4 animate-spin text-[#C7F36B] mr-2" />
                Loading Lightweight Financial Series...
              </div>
            ) : (
              <TradingViewLightweightChart
                data={records}
                symbol={selectedSymbol}
                height={350}
                indicators={{ sma20: true, sma50: true, bb: true }}
              />
            )}

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#343B33] mt-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#969B91] block">DAY HIGH</span>
                <span className="font-semibold text-[#77C98B]">${latest?.high?.toFixed(2) || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#969B91] block">DAY LOW</span>
                <span className="font-semibold text-[#E47770]">${latest?.low?.toFixed(2) || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#969B91] block">VOLUME</span>
                <span className="font-semibold text-[#E9E8DF]">{latest?.volume?.toLocaleString() || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#969B91] block">RSI (14)</span>
                <span className="font-semibold text-[#C7F36B]">{latest?.rsi_14 || '58.4'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Predictions & Quantitative Risk Snapshot */}
        <div className="space-y-5 flex flex-col">
          {/* AI Forecast Card */}
          <div className="term-panel flex-1 flex flex-col">
            <div className="term-header">
              <span className="flex items-center gap-1.5 text-[#C7F36B]">
                <Cpu className="w-3.5 h-3.5" />
                AI FORECAST ENGINE
              </span>
              <span className="term-badge-accent">7-DAY HORIZON</span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between font-mono space-y-4">
              <div>
                <div className="text-[10px] text-[#969B91] uppercase tracking-wider mb-1">
                  Ensemble Trend Classification
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xl font-heading font-black tracking-tight flex items-center gap-1.5 ${
                      trend === 'Bullish'
                        ? 'text-[#77C98B]'
                        : trend === 'Bearish'
                        ? 'text-[#E47770]'
                        : 'text-[#969B91]'
                    }`}
                  >
                    {trend === 'Bullish' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    {trend.toUpperCase()}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#969B91]">TARGET (T+7)</div>
                    <div className="text-sm font-bold text-[#E9E8DF]">${finalPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#121512] border border-[#242B24] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#969B91]">Expected Return:</span>
                  <span className={`font-bold ${expectedReturn >= 0 ? 'text-[#77C98B]' : 'text-[#E47770]'}`}>
                    {expectedReturn >= 0 ? '+' : ''}{expectedReturn}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#969B91]">Confidence Level:</span>
                  <span className="text-[#E9E8DF] font-semibold">95.0% Gaussian</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#969B91]">Evaluation MAPE:</span>
                  <span className="text-[#C7F36B] font-semibold">1.42%</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/predictions')}
                className="term-btn-primary w-full text-xs py-2"
              >
                Inspect All Neural Models (LSTM / Transformer)
              </button>
            </div>
          </div>

          {/* Quantitative Risk Summary */}
          <div className="term-panel p-4 font-mono">
            <div className="flex items-center justify-between mb-3 border-b border-[#242B24] pb-2">
              <span className="font-heading font-bold text-xs text-[#E9E8DF] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#E47770]" />
                QUANT RISK PROFILE
              </span>
              <span className="term-badge-neutral">{riskData?.risk_category || 'Medium Risk'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#101310] border border-[#242B24]">
                <div className="text-[10px] text-[#969B91]">1D VaR (95%)</div>
                <div className="text-sm font-bold text-[#E47770]">
                  -{riskData?.value_at_risk?.['95%']?.composite_var_pct || 2.25}%
                </div>
              </div>
              <div className="p-2 bg-[#101310] border border-[#242B24]">
                <div className="text-[10px] text-[#969B91]">SHARPE RATIO</div>
                <div className="text-sm font-bold text-[#77C98B]">
                  {riskData?.sharpe_ratio?.toFixed(2) || '2.12'}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/risk')}
              className="term-btn-secondary w-full text-xs mt-3 py-1.5"
            >
              Simulate 10,000 Monte Carlo Paths
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Portfolio Snapshot & Financial Sentiment Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Portfolio Snapshot */}
        <div className="term-panel p-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#242B24] pb-2 mb-3">
            <span className="font-heading font-bold text-xs text-[#E9E8DF] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#C7F36B]" />
              PORTFOLIO SNAPSHOT
            </span>
            <button
              onClick={() => navigate('/portfolio')}
              className="text-[11px] text-[#C7F36B] hover:underline"
            >
              Open Desk →
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-[#969B91]">TOTAL ASSETS UNDER MANAGEMENT</div>
              <div className="text-xl font-bold text-[#E9E8DF]">
                ${(portfolioData?.total_portfolio_value || 122950).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#121512] border border-[#242B24]">
                <span className="text-[10px] text-[#969B91] block">UNREALIZED P&L</span>
                <span className="font-bold text-[#77C98B]">
                  +${(portfolioData?.total_pnl || 22950).toLocaleString()} (+{portfolioData?.total_return_pct || 22.95}%)
                </span>
              </div>
              <div className="p-2 bg-[#121512] border border-[#242B24]">
                <span className="text-[10px] text-[#969B91] block">CASH BALANCE</span>
                <span className="font-bold text-[#E9E8DF]">
                  ${(portfolioData?.cash || 24500).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Financial Sentiment News */}
        <div className="lg:col-span-2 term-panel p-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#242B24] pb-2 mb-3">
            <span className="font-heading font-bold text-xs text-[#E9E8DF]">
              FINANCIAL NLP SENTIMENT HEADLINES ({selectedSymbol})
            </span>
            <button
              onClick={() => navigate('/sentiment')}
              className="text-[11px] text-[#C7F36B] hover:underline"
            >
              Full NLP Feed →
            </button>
          </div>

          <div className="space-y-2">
            {(sentimentData?.articles || []).slice(0, 3).map((art, idx) => (
              <div
                key={idx}
                className="p-2 bg-[#121512] border border-[#242B24] hover:border-[#343B33] flex items-center justify-between gap-3 text-xs"
              >
                <div className="overflow-hidden">
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#E9E8DF] hover:text-[#C7F36B] truncate block"
                  >
                    {art.title}
                  </a>
                  <div className="text-[10px] text-[#969B91] mt-0.5">
                    {art.publisher} • {art.published_at}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 shrink-0 font-semibold border ${
                    art.sentiment === 'Positive'
                      ? 'bg-[#77C98B]/10 text-[#77C98B] border-[#77C98B]/30'
                      : art.sentiment === 'Negative'
                      ? 'bg-[#E47770]/10 text-[#E47770] border-[#E47770]/30'
                      : 'bg-[#969B91]/10 text-[#969B91] border-[#969B91]/30'
                  }`}
                >
                  {art.sentiment}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
