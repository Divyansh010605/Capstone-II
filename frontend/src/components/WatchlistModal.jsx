import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';

export const WatchlistModal = ({
  isOpen,
  onClose,
  watchlist,
  onSelectStock,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}) => {
  const [newSymbol, setNewSymbol] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      onAddToWatchlist(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-6 border border-white/10 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono">Market Watchlist</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-mono">
            ESC / Close
          </button>
        </div>

        {/* Add Ticker Input */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="Add symbol (e.g. MSFT, TSLA, SPY)..."
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            className="flex-1 bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="btn-primary text-xs font-mono px-3">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* Watchlist Items */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {watchlist.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              Your watchlist is empty. Add a symbol above to track real-time.
            </div>
          ) : (
            watchlist.map((stock) => {
              const isUp = stock.current_price >= stock.previous_close;
              const chgPct = stock.previous_close
                ? (((stock.current_price - stock.previous_close) / stock.previous_close) * 100).toFixed(2)
                : '0.00';

              return (
                <div
                  key={stock.symbol}
                  className="p-3 rounded-lg bg-[#090d16] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
                >
                  <div
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      onClose();
                    }}
                    className="cursor-pointer space-y-0.5 flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-white text-sm">{stock.symbol}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{stock.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{stock.sector || 'Equities'}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-white">${stock.current_price?.toFixed(2)}</div>
                      <div
                        className={`text-[11px] font-bold flex items-center justify-end ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {chgPct}%
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromWatchlist(stock.symbol)}
                      className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
