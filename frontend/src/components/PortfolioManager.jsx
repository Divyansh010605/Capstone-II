import React, { useState } from 'react';
import { PieChart, Plus, Trash2, ArrowUpRight, ArrowDownRight, DollarSign, ShieldCheck } from 'lucide-react';

export const PortfolioManager = ({
  portfolio,
  onAddPosition,
  onRemovePosition,
  availableStocks,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [quantity, setQuantity] = useState(10);
  const [buyPrice, setBuyPrice] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const price = buyPrice ? parseFloat(buyPrice) : null;
    onAddPosition(selectedStock, parseInt(quantity, 10), price);
    setShowAddModal(false);
    setBuyPrice('');
  };

  const positions = portfolio?.positions || [];
  const allocations = portfolio?.allocations || [];
  const portRisk = portfolio?.portfolio_risk;

  return (
    <div className="space-y-6">
      {/* Overview Metric Bar */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {portfolio?.name || 'Virtual Core Portfolio'}
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Live Valuation
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-Asset Virtual Portfolio with Automated Mark-to-Market Valuation & Covariance Risk
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs font-mono"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Total Portfolio Value</span>
            <div className="mt-1 text-2xl font-bold font-mono text-white">
              ${portfolio?.total_portfolio_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Cash: ${portfolio?.cash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Unrealized P&L</span>
            <div
              className={`mt-1 text-2xl font-bold font-mono flex items-center gap-1 ${
                portfolio?.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolio?.total_pnl >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
              ${Math.abs(portfolio?.total_pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400">
              Return: {portfolio?.total_return_pct > 0 ? `+${portfolio?.total_return_pct}%` : `${portfolio?.total_return_pct}%`}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Portfolio Volatility (σ)</span>
            <div className="mt-1 text-2xl font-bold font-mono text-purple-400">
              {portRisk?.portfolio_volatility_pct || '18.4'}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Risk: {portRisk?.portfolio_risk_category || 'Medium Risk'}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Diversification Benefit</span>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-5 h-5" />
              {portRisk?.diversification_benefit_pct || '15.2'}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Risk reduction vs sum</span>
          </div>
        </div>

        {/* Allocation Horizontal Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Asset Allocation Distribution</span>
            <span>{positions.length} Active Equities</span>
          </div>
          <div className="h-3 w-full bg-[#090d16] rounded-full overflow-hidden flex border border-white/5">
            {allocations.map((alloc, idx) => {
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
              const c = colors[idx % colors.length];
              return (
                <div
                  key={alloc.symbol}
                  title={`${alloc.symbol}: ${alloc.allocation_pct}%`}
                  className={`${c} h-full transition-all`}
                  style={{ width: `${alloc.allocation_pct}%` }}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            {allocations.map((alloc, idx) => {
              const colors = ['text-blue-400', 'text-indigo-400', 'text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-rose-400'];
              const c = colors[idx % colors.length];
              return (
                <span key={alloc.symbol} className="text-xs font-mono flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length].replace('text-', 'bg-')}`}></span>
                  <strong className={c}>{alloc.symbol}</strong>: {alloc.allocation_pct}%
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white font-mono">Current Stock Positions</h4>
          <span className="text-xs text-slate-400 font-mono">Mark-to-Market Auto-Refresh</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d16] text-slate-400 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Qty</th>
                <th className="px-5 py-3.5">Avg Buy</th>
                <th className="px-5 py-3.5">Current</th>
                <th className="px-5 py-3.5">Market Value</th>
                <th className="px-5 py-3.5">P&L ($)</th>
                <th className="px-5 py-3.5">P&L (%)</th>
                <th className="px-5 py-3.5">Alloc</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-8 text-center text-slate-500 font-mono">
                    No positions currently held in this portfolio.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const isProfit = pos.unrealized_pnl >= 0;
                  return (
                    <tr key={pos.symbol} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{pos.symbol}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{pos.name}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{pos.quantity}</td>
                      <td className="px-5 py-3.5 text-slate-400">${pos.avg_buy_price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-white font-bold">${pos.current_price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-white font-bold">${pos.current_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`px-5 py-3.5 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${pos.unrealized_pnl?.toFixed(2)}
                      </td>
                      <td className={`px-5 py-3.5 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}{pos.unrealized_pnl_pct?.toFixed(2)}%
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{pos.allocation_pct}%</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onRemovePosition(pos.symbol)}
                          title="Sell Position"
                          className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Add Stock Position
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Stock Symbol</label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  {availableStocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Custom Buy Price (Optional - leaves default to market price)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 175.50"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-mono">
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
