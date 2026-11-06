import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShieldCheck,
  Briefcase,
  Layers,
  X,
} from 'lucide-react';

export const PortfolioManager = ({
  portfolio,
  onAddPosition,
  onRemovePosition,
  availableStocks = [],
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

  const colorPalette = [
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#f43f5e', // rose
    '#6366f1', // indigo
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Card */}
      <div className="glass-card p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {portfolio?.name || 'Virtual Multi-Asset Core'}
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold uppercase tracking-wider">
                  Mark-to-Market Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Asset Virtual Portfolio with Automated Covariance Risk Matrix Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs font-mono px-4 py-2 flex items-center gap-2 self-stretch md:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Position</span>
          </button>
        </div>

        {/* Portfolio Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Total Portfolio Value</span>
            <div className="mt-2 text-2xl font-black font-mono text-white">
              ${portfolio?.total_portfolio_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Cash: ${portfolio?.cash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Total Unrealized P&L</span>
            <div
              className={`mt-2 text-2xl font-black font-mono flex items-center gap-1 ${
                portfolio?.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolio?.total_pnl >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
              ${Math.abs(portfolio?.total_pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-300 mt-1 block">
              Return: {portfolio?.total_return_pct > 0 ? `+${portfolio?.total_return_pct}%` : `${portfolio?.total_return_pct}%`}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Portfolio Volatility (σ)</span>
            <div className="mt-2 text-2xl font-black font-mono text-purple-400">
              {portRisk?.portfolio_volatility_pct || '18.4'}%
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Risk: {portRisk?.portfolio_risk_category || 'Medium Risk'}
            </span>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Diversification Benefit</span>
            <div className="mt-2 text-2xl font-black font-mono text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              {portRisk?.diversification_benefit_pct || '18.6'}%
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Covariance risk discount
            </span>
          </div>
        </div>

        {/* Asset Allocation Distribution Bar */}
        <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Asset Allocation Breakdown
            </span>
            <span className="text-slate-400">{positions.length} Active Positions</span>
          </div>

          {/* Allocation progress bar */}
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-white/10">
            {allocations.map((alloc, idx) => (
              <div
                key={alloc.symbol}
                title={`${alloc.symbol}: ${alloc.allocation_pct}%`}
                className="h-full transition-all hover:opacity-80"
                style={{
                  width: `${alloc.allocation_pct}%`,
                  backgroundColor: colorPalette[idx % colorPalette.length],
                }}
              />
            ))}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {allocations.map((alloc, idx) => {
              const color = colorPalette[idx % colorPalette.length];
              return (
                <div
                  key={alloc.symbol}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-mono flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                  <strong className="text-white">{alloc.symbol}</strong>
                  <span className="text-slate-400">{alloc.allocation_pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Current Equity Holdings
          </h4>
          <span className="text-xs text-slate-400 font-mono">Real-time Valuation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d16] text-slate-400 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Shares</th>
                <th className="px-5 py-3.5">Avg Cost</th>
                <th className="px-5 py-3.5">Current Price</th>
                <th className="px-5 py-3.5">Market Value</th>
                <th className="px-5 py-3.5">Unrealized P&L</th>
                <th className="px-5 py-3.5">Return (%)</th>
                <th className="px-5 py-3.5">Alloc</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-slate-500 font-mono">
                    No positions currently held. Click "Add Stock Position" above to buy shares.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const isProfit = pos.unrealized_pnl >= 0;
                  return (
                    <tr key={pos.symbol} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{pos.symbol}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{pos.name}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-200 font-medium">{pos.quantity}</td>
                      <td className="px-5 py-3.5 text-slate-400">${pos.avg_buy_price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-white font-bold">${pos.current_price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-white font-bold">
                        ${pos.current_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-5 py-3.5 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${pos.unrealized_pnl?.toFixed(2)}
                      </td>
                      <td className={`px-5 py-3.5 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}{pos.unrealized_pnl_pct?.toFixed(2)}%
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 font-medium">{pos.allocation_pct}%</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onRemovePosition(pos.symbol)}
                          title="Liquidate / Remove Position"
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/30"
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

      {/* Add Stock Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card modal-content max-w-md w-full p-6 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Add Position to Portfolio
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Select Stock Ticker</label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                >
                  {(availableStocks.length > 0 ? availableStocks : [
                    { symbol: 'AAPL', name: 'Apple Inc.' },
                    { symbol: 'MSFT', name: 'Microsoft Corporation' },
                    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
                    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
                    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
                    { symbol: 'TSLA', name: 'Tesla Inc.' },
                    { symbol: 'META', name: 'Meta Platforms Inc.' },
                    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
                  ]).map((s) => (
                    <option key={s.symbol} value={s.symbol} className="bg-slate-900 text-white">
                      {s.symbol} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Number of Shares (Quantity)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Execution Buy Price (Leave blank to use current market price)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 185.50"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-mono px-4 py-2">
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
