import React from 'react';
import { TrendingUp, ShieldAlert, PieChart, Newspaper, Bookmark, Search, User, Terminal } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  selectedSymbol,
  setSelectedSymbol,
  popularStocks,
  onOpenWatchlist,
  user,
  onOpenAuth,
}) => {
  return (
    <header className="glass-card mb-6 p-4 sticky top-4 z-40 flex flex-wrap items-center justify-between gap-4 border border-[rgba(255,255,255,0.08)]">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            ALPHA<span className="text-blue-500">AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            US Market Feed Active • PyTorch Ensemble
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#0c121e] p-1.5 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab('technicals')}
          className={`tab-btn ${activeTab === 'technicals' ? 'active' : ''}`}
        >
          <TrendingUp className="w-4 h-4" />
          Technicals
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
        >
          <Terminal className="w-4 h-4" />
          AI Forecast
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
        >
          <ShieldAlert className="w-4 h-4" />
          Risk Analysis
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
        >
          <PieChart className="w-4 h-4" />
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`tab-btn ${activeTab === 'sentiment' ? 'active' : ''}`}
        >
          <Newspaper className="w-4 h-4" />
          Sentiment
        </button>
      </nav>

      {/* Symbol Quick Select & Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Quick Tickers */}
        <div className="hidden lg:flex items-center gap-1">
          {popularStocks.slice(0, 5).map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                selectedSymbol === stock.symbol
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {stock.symbol}
            </button>
          ))}
        </div>

        {/* Custom Symbol Search Form */}
        <div className="relative">
          <input
            type="text"
            placeholder="Symbol (e.g. NVDA)..."
            defaultValue={selectedSymbol}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setSelectedSymbol(e.target.value.trim().toUpperCase());
              }
            }}
            className="w-32 md:w-36 bg-[#0a0e17] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Watchlist Toggle */}
        <button
          onClick={onOpenWatchlist}
          title="Open Watchlist"
          className="btn-secondary text-xs px-2.5 py-1.5"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Watchlist</span>
        </button>

        {/* User Auth Modal Button */}
        <button
          onClick={onOpenAuth}
          className="btn-secondary text-xs px-2.5 py-1.5"
        >
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">{user ? user.username : 'Account'}</span>
        </button>
      </div>
    </header>
  );
};
