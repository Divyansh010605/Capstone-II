import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

export const WatchlistModal = ({
  isOpen,
  onClose,
  watchlist = [],
  onSelectStock,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}) => {
  const [newSymbol, setNewSymbol] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      onAddToWatchlist(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card modal-content max-w-lg w-full p-6 border border-white/15 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono tracking-tight">Market Watchlist</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Ticker Input */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="Add ticker symbol (e.g. MSFT, NVDA, SPY)..."
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            className="flex-1 bg-[#090d16] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase"
          />
          <button
            type="submit"
            className="btn-primary text-xs font-mono px-4 py-2.5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Watchlist Items */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {watchlist.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              Your watchlist is currently empty. Add a symbol above to track real-time.
            </div>
          ) : (
            watchlist.map((stock) => {
              const isUp = (stock.current_price || 0) >= (stock.previous_close || 0);
              const chgPct = stock.previous_close
                ? (((stock.current_price - stock.previous_close) / stock.previous_close) * 100).toFixed(2)
                : '0.00';

              return (
                <div
                  key={stock.symbol}
                  className="p-3.5 rounded-xl bg-[#090d16] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
                >
                  <div
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      onClose();
                    }}
                    className="cursor-pointer space-y-0.5 flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-white text-sm group-hover:text-cyan-400 transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {stock.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {stock.sector || 'Equities'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-white">
                        ${stock.current_price ? stock.current_price.toFixed(2) : '150.00'}
                      </div>
                      <div
                        className={`text-[11px] font-bold flex items-center justify-end ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {chgPct > 0 ? `+${chgPct}%` : `${chgPct}%`}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromWatchlist(stock.symbol)}
                      className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/30"
                      title="Remove from Watchlist"
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
