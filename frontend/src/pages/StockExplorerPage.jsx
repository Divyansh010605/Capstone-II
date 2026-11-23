import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Activity,
  BookmarkPlus,
  BookmarkCheck,
  TrendingUp,
  Cpu,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
import { TradingViewLightweightChart } from '../components/charts/TradingViewLightweightChart';

const TIMEFRAMES = [
  { id: '1mo', label: '1M' },
  { id: '3mo', label: '3M' },
  { id: '6mo', label: '6M' },
  { id: '1y', label: '1Y' },
  { id: '5y', label: '5Y' },
];

export const StockExplorerPage = () => {
  const {
    selectedSymbol,
    changeSymbol,
    period,
    setPeriod,
    availableStocks,
    historyData,
    loadingHistory,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useTerminal();

  const navigate = useNavigate();

  // Indicator toggles
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: true,
    ema12: false,
    bb: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  const records = historyData?.data || [];
  const latest = records[records.length - 1];
  const prev = records[records.length - 2];
  const latestClose = latest?.close || 185.0;
  const prevClose = prev?.close || latestClose;
  const chg = latestClose - prevClose;
  const chgPct = prevClose > 0 ? ((chg / prevClose) * 100).toFixed(2) : '0.00';
  const isUp = chg >= 0;

  const isWatched = (watchlist || []).some(
    (w) => (typeof w === 'string' ? w : w.symbol) === selectedSymbol
  );

  const sectors = ['ALL', ...new Set((availableStocks || []).map((s) => s.sector).filter(Boolean))];

  const filteredUniverse = (availableStocks || []).filter((s) => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header Bar: Active Ticker Info & Watchlist Toggle */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[10px] text-[#969B91]">ACTIVE SECURITY</div>
            <div className="font-heading font-black text-2xl text-[#E9E8DF] tracking-tight">
              {selectedSymbol}
            </div>
          </div>
          <div className="h-8 w-px bg-[#343B33] hidden sm:block"></div>
          <div>
            <div className="text-[10px] text-[#969B91]">LAST PRICE</div>
            <div className="text-xl font-bold text-[#E9E8DF]">
              ${latestClose.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#969B91]">DAY CHANGE</div>
            <div className={`text-base font-bold ${isUp ? 'text-[#77C98B]' : 'text-[#E47770]'}`}>
              {isUp ? '+' : ''}${chg.toFixed(2)} ({isUp ? '+' : ''}{chgPct}%)
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isWatched) removeFromWatchlist(selectedSymbol);
              else addToWatchlist(selectedSymbol);
            }}
            className={`term-btn-secondary text-xs ${
              isWatched ? 'border-[#C7F36B] text-[#C7F36B]' : ''
            }`}
          >
            {isWatched ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{isWatched ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}</span>
          </button>

          <button
            onClick={() => navigate('/predictions')}
            className="term-btn-primary text-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PREDICT (AI)</span>
          </button>

          <button
            onClick={() => navigate('/risk')}
            className="term-btn-secondary text-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#E47770]" />
            <span>RISK ENGINE</span>
          </button>
        </div>
      </div>

      {/* 2. Chart Section with Timeframe & Indicator Controls */}
      <div className="term-panel">
        <div className="term-header flex flex-wrap gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 font-mono">
            <span className="text-[10px] text-[#969B91] mr-1 hidden sm:inline">HORIZON:</span>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setPeriod(tf.id)}
                className={`px-2 py-0.5 text-xs font-mono transition-colors ${
                  period === tf.id
                    ? 'bg-[#C7F36B] text-[#101310] font-bold'
                    : 'text-[#969B91] hover:text-[#E9E8DF] bg-[#202720]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[10px] text-[#969B91] hidden sm:inline">INDICATORS:</span>
            <button
              onClick={() => setIndicators((prev) => ({ ...prev, sma20: !prev.sma20 }))}
              className={`px-2 py-0.5 text-[11px] border ${
                indicators.sma20
                  ? 'border-[#C7F36B] text-[#C7F36B] bg-[#C7F36B]/10 font-semibold'
                  : 'border-[#343B33] text-[#969B91]'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setIndicators((prev) => ({ ...prev, sma50: !prev.sma50 }))}
              className={`px-2 py-0.5 text-[11px] border ${
                indicators.sma50
                  ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/10 font-semibold'
                  : 'border-[#343B33] text-[#969B91]'
              }`}
            >
              SMA 50
            </button>
            <button
              onClick={() => setIndicators((prev) => ({ ...prev, bb: !prev.bb }))}
              className={`px-2 py-0.5 text-[11px] border ${
                indicators.bb
                  ? 'border-[#A78BFA] text-[#A78BFA] bg-[#A78BFA]/10 font-semibold'
                  : 'border-[#343B33] text-[#969B91]'
              }`}
            >
              BOLLINGER BANDS
            </button>
          </div>
        </div>

        <div className="p-3">
          {loadingHistory ? (
            <div className="h-[440px] flex items-center justify-center font-mono text-xs text-[#969B91]">
              <Activity className="w-5 h-5 animate-spin text-[#C7F36B] mr-2" />
              Loading High-Frequency Market Ticks...
            </div>
          ) : (
            <TradingViewLightweightChart
              data={records}
              symbol={selectedSymbol}
              height={440}
              indicators={indicators}
            />
          )}
        </div>
      </div>

      {/* 3. Fundamental & Technical Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quantitative Technical Metrics Table */}
        <div className="lg:col-span-2 term-panel p-4 font-mono">
          <div className="font-heading font-bold text-xs text-[#E9E8DF] mb-3 border-b border-[#242B24] pb-2 uppercase tracking-wide">
            Quantitative Technical Indicators & Descriptive Stats
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">RSI (14-DAY)</span>
              <span className="text-base font-bold text-[#E9E8DF]">{latest?.rsi_14 || '58.4'}</span>
              <span className="text-[9px] text-[#969B91] block mt-0.5">NEUTRAL MOMENTUM</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">MACD DIVERGENCE</span>
              <span className="text-base font-bold text-[#77C98B]">{latest?.macd || '+1.42'}</span>
              <span className="text-[9px] text-[#969B91] block mt-0.5">SIGNAL: {latest?.macd_signal || '+0.88'}</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">52-WEEK RANGE</span>
              <span className="text-sm font-bold text-[#E9E8DF]">$145.20 - $198.50</span>
              <span className="text-[9px] text-[#969B91] block mt-0.5">PCT OF HIGH: 93.4%</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">ESTIMATED MARKET CAP</span>
              <span className="text-base font-bold text-[#E9E8DF]">$2.85T</span>
              <span className="text-[9px] text-[#969B91] block mt-0.5">MEGA CAP EQUITIES</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">PRICE-TO-EARNINGS (P/E)</span>
              <span className="text-base font-bold text-[#E9E8DF]">29.4x</span>
              <span className="text-[9px] text-[#969B91] block mt-0.5">SECTOR AVG: 26.2x</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">HISTORICAL BETA (1Y)</span>
              <span className="text-base font-bold text-[#E9E8DF]">1.18</span>
              <span className="text-[9px] text-[#969B91] block mt-0.5">HIGH SPY CORRELATION</span>
            </div>
          </div>
        </div>

        {/* Universe Explorer & Stock Switcher */}
        <div className="term-panel p-4 font-mono flex flex-col">
          <div className="font-heading font-bold text-xs text-[#E9E8DF] mb-3 border-b border-[#242B24] pb-2 uppercase tracking-wide flex justify-between items-center">
            <span>Market Universe</span>
            <span className="text-[10px] text-[#969B91]">{filteredUniverse.length} Stocks</span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#969B91] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter universe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="term-input pl-8 text-xs"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
              {sectors.slice(0, 4).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-2 py-0.5 whitespace-nowrap border ${
                    selectedSector === sec
                      ? 'border-[#C7F36B] text-[#C7F36B] bg-[#C7F36B]/10 font-bold'
                      : 'border-[#343B33] text-[#969B91]'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 divide-y divide-[#202720]">
            {filteredUniverse.map((stk) => (
              <div
                key={stk.symbol}
                onClick={() => changeSymbol(stk.symbol)}
                className={`py-2 px-2 cursor-pointer flex items-center justify-between text-xs hover:bg-[#202720] ${
                  stk.symbol === selectedSymbol ? 'bg-[#202720] border-l-2 border-[#C7F36B]' : ''
                }`}
              >
                <div>
                  <span className="font-bold text-[#E9E8DF]">{stk.symbol}</span>
                  <div className="text-[10px] text-[#969B91] truncate max-w-[150px]">{stk.name}</div>
                </div>
                <span className="text-[10px] font-mono text-[#969B91]">{stk.sector}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
