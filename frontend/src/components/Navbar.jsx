import React, { useState } from 'react';
import {
  TrendingUp,
  Cpu,
  ShieldAlert,
  PieChart,
  Newspaper,
  Bookmark,
  Search,
  User,
  Radio,
  Sparkles,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  selectedSymbol,
  setSelectedSymbol,
  popularStocks = [],
  onOpenWatchlist,
  user,
  onOpenAuth,
  isBackendOnline,
}) => {
  const [searchInput, setSearchInput] = useState(selectedSymbol);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedSymbol(searchInput.trim().toUpperCase());
    }
  };

  const tickers = popularStocks.length > 0
    ? popularStocks.slice(0, 6)
    : [
        { symbol: 'AAPL' },
        { symbol: 'MSFT' },
        { symbol: 'NVDA' },
        { symbol: 'GOOGL' },
        { symbol: 'AMZN' },
        { symbol: 'TSLA' },
      ];

  const navTabs = [
    { id: 'technicals', label: 'Technicals', icon: TrendingUp },
    { id: 'predictions', label: 'AI Forecast', icon: Cpu },
    { id: 'risk', label: 'Risk Profiler', icon: ShieldAlert },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'sentiment', label: 'News Sentiment', icon: Newspaper },
  ];

  return (
    <header className="glass-card mb-6 p-3.5 sm:p-4 sticky top-3 z-40 border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Brand & Market Status */}
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">
                  ALPHA<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">QUANT</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold uppercase tracking-wider">
                  AI v2.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`}></span>
                  <span className={isBackendOnline ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
                    {isBackendOnline ? 'FASTAPI LIVE' : 'FEED SYNCHRONIZED'}
                  </span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="hidden sm:inline text-slate-400">PyTorch Ensemble Active</span>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={onOpenWatchlist}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400 hover:bg-white/10"
              title="Watchlist"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10"
              title="Account"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-start sm:justify-center overflow-x-auto gap-1 bg-[#090d16] p-1.5 rounded-xl border border-white/10 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn flex-1 sm:flex-initial text-xs ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Ticker Search & Quick Switchers */}
        <div className="flex items-center gap-2.5">
          {/* Quick Tickers Carousel */}
          <div className="hidden xl:flex items-center gap-1">
            {tickers.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  setSearchInput(stock.symbol);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedSymbol === stock.symbol
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {stock.symbol}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Ticker (e.g. NVDA)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              className="w-full sm:w-36 md:w-44 bg-[#090d16] border border-white/15 rounded-xl pl-3 pr-8 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner uppercase"
            />
            <button
              type="submit"
              className="absolute right-2 top-2.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Desktop Watchlist & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenWatchlist}
              className="btn-secondary text-xs px-3 py-2 font-mono flex items-center gap-1.5 border-white/10 hover:border-amber-500/30"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Watchlist</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="btn-secondary text-xs px-3 py-2 font-mono flex items-center gap-1.5 border-white/10 hover:border-cyan-500/30"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user ? user.username : 'Account'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
