import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Cpu,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';

export const WatchlistPage = () => {
  const {
    watchlist,
    availableStocks,
    addToWatchlist,
    removeFromWatchlist,
    changeSymbol,
  } = useTerminal();

  const navigate = useNavigate();
  const [newTicker, setNewTicker] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    setErrorMsg('');
    try {
      await addToWatchlist(newTicker.trim().toUpperCase());
      setNewTicker('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add ticker to watchlist.');
    }
  };

  const handleExplore = (sym) => {
    changeSymbol(sym);
    navigate('/explorer');
  };

  const handlePredict = (sym) => {
    changeSymbol(sym);
    navigate('/predictions');
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header & Quick Add */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              INSTITUTIONAL WATCHLIST & TICKER MONITOR
            </span>
            <span className="term-badge-accent">{watchlist.length} TRACKED</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Real-Time Tick Stream, 24-Hour Price Movement & One-Click Deep Model Routing
          </p>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ADD TICKER (E.G. NVDA)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            className="term-input uppercase w-48 text-xs py-1.5"
          />
          <button type="submit" className="term-btn-primary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />
            <span>ADD</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-[#E47770]/15 border border-[#E47770] text-[#E47770] font-mono text-xs">
          {errorMsg}
        </div>
      )}

      {/* 2. Main Watchlist Table */}
      <div className="term-panel">
        <div className="term-header">
          <span>TRACKED SECURITIES MONITOR</span>
          <span className="text-[10px] font-mono text-[#969B91]">LIVE QUOTES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="term-table">
            <thead>
              <tr>
                <th>SECURITY / NAME</th>
                <th>LAST PRICE</th>
                <th>PREVIOUS CLOSE</th>
                <th>24H CHANGE</th>
                <th>SECTOR</th>
                <th>DAY RANGE BAR</th>
                <th className="text-right">QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.length > 0 ? (
                watchlist.map((item) => {
                  const sym = typeof item === 'string' ? item : item.symbol;
                  const name = item.name || `${sym} Equity`;
                  const price = item.current_price || 185.0;
                  const prevClose = item.previous_close || 182.0;
                  const chg = price - prevClose;
                  const chgPct = prevClose > 0 ? ((chg / prevClose) * 100).toFixed(2) : '0.00';
                  const isUp = chg >= 0;

                  return (
                    <tr key={sym}>
                      <td>
                        <div
                          onClick={() => handleExplore(sym)}
                          className="font-bold text-[#E9E8DF] cursor-pointer hover:text-[#C7F36B] transition-colors"
                        >
                          {sym}
                        </div>
                        <div className="text-[10px] text-[#969B91] truncate max-w-xs">{name}</div>
                      </td>
                      <td className="font-bold text-[#E9E8DF]">${price.toFixed(2)}</td>
                      <td className="text-[#969B91]">${prevClose.toFixed(2)}</td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            isUp ? 'text-[#77C98B]' : 'text-[#E47770]'
                          }`}
                        >
                          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isUp ? '+' : ''}${chg.toFixed(2)} ({isUp ? '+' : ''}{chgPct}%)
                        </span>
                      </td>
                      <td className="text-[#969B91]">{item.sector || 'Equities'}</td>
                      <td>
                        <div className="w-32 bg-[#202720] h-2 border border-[#343B33] overflow-hidden">
                          <div
                            className={`h-full ${isUp ? 'bg-[#77C98B]' : 'bg-[#E47770]'}`}
                            style={{ width: `${Math.min(100, Math.max(15, 50 + chg * 5))}%` }}
                          />
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExplore(sym)}
                            className="px-2 py-0.5 bg-[#202720] hover:bg-[#343B33] text-[#E9E8DF] border border-[#343B33] text-[10px] font-bold"
                          >
                            EXPLORER
                          </button>
                          <button
                            onClick={() => handlePredict(sym)}
                            className="px-2 py-0.5 bg-[#202720] hover:bg-[#343B33] text-[#C7F36B] border border-[#343B33] text-[10px] font-bold"
                          >
                            PREDICT
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(sym)}
                            className="p-1 text-[#969B91] hover:text-[#E47770]"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#969B91]">
                    Watchlist is currently empty. Enter a ticker above to begin monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
