import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  X,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
import { PortfolioAllocationChart } from '../components/charts/PortfolioAllocationChart';

export const PortfolioPage = () => {
  const {
    portfolioData,
    addPosition,
    removePosition,
    availableStocks,
    changeSymbol,
  } = useTerminal();

  // Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderType, setOrderType] = useState('BUY'); // BUY or SELL
  const [ticker, setTicker] = useState('AAPL');
  const [shares, setShares] = useState(10);
  const [customPrice, setCustomPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const positions = portfolioData?.positions || [];
  const cash = portfolioData?.cash || 24500.0;
  const totalVal = portfolioData?.total_portfolio_value || 122950.0;
  const totalPnl = portfolioData?.total_pnl || 22950.0;
  const returnPct = portfolioData?.total_return_pct || 22.95;
  const invested = portfolioData?.total_invested || 75500.0;

  const handleOpenOrder = (sym = 'AAPL', type = 'BUY') => {
    setTicker(sym);
    setOrderType(type);
    setShares(10);
    setCustomPrice('');
    setModalError('');
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const qty = parseInt(shares, 10);
      if (isNaN(qty) || qty <= 0) throw new Error('Quantity must be a positive integer.');

      const price = customPrice ? parseFloat(customPrice) : null;

      if (orderType === 'BUY') {
        await addPosition(ticker, qty, price);
      } else {
        await removePosition(ticker, qty);
      }
      setShowOrderModal(false);
    } catch (err) {
      setModalError(err.message || 'Order execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLiquidate = async (sym) => {
    if (window.confirm(`Liquidate entire position in ${sym}?`)) {
      try {
        await removePosition(sym, null);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header & Valuation Banner */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              INSTITUTIONAL PORTFOLIO MANAGEMENT
            </span>
            <span className="term-badge-positive">LIVE MTM MARGIN</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Real-Time Position Tracking, Cost Basis Accounting & Multi-Asset Risk Balancing
          </p>
        </div>

        <button
          onClick={() => handleOpenOrder('AAPL', 'BUY')}
          className="term-btn-primary text-xs self-start md:self-auto flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>EXECUTE ORDER</span>
        </button>
      </div>

      {/* 2. Portfolio Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">TOTAL PORTFOLIO VALUE</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">
            ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-[#969B91] mt-1">MARK-TO-MARKET ASSETS</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">UNREALIZED PROFIT / LOSS</div>
          <div className="text-xl font-bold text-[#77C98B] mt-1">
            +${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-[#77C98B] mt-1">+{returnPct}% OVERALL RETURN</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">USD CASH BALANCE</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">
            ${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-[#969B91] mt-1">AVAILABLE SETTLED FUNDS</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">CAPITAL INVESTED</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">
            ${invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] text-[#969B91] mt-1">TOTAL EQUITIES COST BASIS</div>
        </div>
      </div>

      {/* 3. Positions Table & Asset Allocation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Positions Table (2 Cols) */}
        <div className="lg:col-span-2 term-panel">
          <div className="term-header">
            <span>ACTIVE SECURITY POSITIONS ({positions.length})</span>
            <span className="text-[10px] font-mono text-[#969B91]">REAL-TIME REVALUATION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="term-table">
              <thead>
                <tr>
                  <th>ASSET</th>
                  <th>QTY</th>
                  <th>AVG PRICE</th>
                  <th>CURRENT</th>
                  <th>VALUATION</th>
                  <th>UNREALIZED P&L</th>
                  <th>WEIGHT</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {positions.length > 0 ? (
                  positions.map((pos) => {
                    const isGain = (pos.unrealized_pnl || 0) >= 0;
                    return (
                      <tr key={pos.symbol}>
                        <td
                          onClick={() => changeSymbol(pos.symbol)}
                          className="cursor-pointer hover:text-[#C7F36B]"
                        >
                          <div className="font-bold text-[#E9E8DF]">{pos.symbol}</div>
                          <div className="text-[10px] text-[#969B91] truncate max-w-[120px]">
                            {pos.name}
                          </div>
                        </td>
                        <td>{pos.quantity}</td>
                        <td>${pos.avg_buy_price?.toFixed(2)}</td>
                        <td className="font-bold">${pos.current_price?.toFixed(2)}</td>
                        <td className="font-bold text-[#E9E8DF]">
                          ${pos.current_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className={isGain ? 'text-[#77C98B]' : 'text-[#E47770]'}>
                          {isGain ? '+' : ''}${pos.unrealized_pnl?.toFixed(2)} (
                          {isGain ? '+' : ''}{pos.unrealized_pnl_pct?.toFixed(2)}%)
                        </td>
                        <td className="text-[#C7F36B] font-semibold">{pos.allocation_pct}%</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenOrder(pos.symbol, 'BUY')}
                              className="px-2 py-0.5 bg-[#202720] hover:bg-[#343B33] text-[#77C98B] border border-[#343B33] text-[10px] font-bold"
                            >
                              BUY
                            </button>
                            <button
                              onClick={() => handleOpenOrder(pos.symbol, 'SELL')}
                              className="px-2 py-0.5 bg-[#202720] hover:bg-[#343B33] text-[#E47770] border border-[#343B33] text-[10px] font-bold"
                            >
                              SELL
                            </button>
                            <button
                              onClick={() => handleLiquidate(pos.symbol)}
                              title="Liquidate Entire Position"
                              className="p-1 hover:text-[#E47770] text-[#969B91]"
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
                    <td colSpan={8} className="text-center py-8 text-[#969B91]">
                      No active equity positions found. Click "Execute Order" to allocate capital.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Donut Chart (1 Col) */}
        <div>
          <PortfolioAllocationChart
            positions={positions}
            cash={cash}
            totalValue={totalVal}
          />
        </div>
      </div>

      {/* 4. Order Execution Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="term-panel w-full max-w-md font-mono shadow-2xl">
            <div className="term-header">
              <span>ORDER EXECUTION TICKET</span>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-[#969B91] hover:text-[#E9E8DF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-4 space-y-4">
              {modalError && (
                <div className="p-2 bg-[#E47770]/15 border border-[#E47770] text-[#E47770] text-xs">
                  {modalError}
                </div>
              )}

              {/* Side (Buy / Sell) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('BUY')}
                  className={`py-2 text-xs font-bold border ${
                    orderType === 'BUY'
                      ? 'bg-[#77C98B] text-[#101310] border-[#77C98B]'
                      : 'bg-[#141814] text-[#969B91] border-[#343B33]'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('SELL')}
                  className={`py-2 text-xs font-bold border ${
                    orderType === 'SELL'
                      ? 'bg-[#E47770] text-[#101310] border-[#E47770]'
                      : 'bg-[#141814] text-[#969B91] border-[#343B33]'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Symbol */}
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">SECURITY TICKER</label>
                <select
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="term-input"
                >
                  {(availableStocks || []).map((s) => (
                    <option key={s.symbol} value={s.symbol} className="bg-[#191E19]">
                      {s.symbol} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shares */}
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">QUANTITY (SHARES)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="term-input"
                  required
                />
              </div>

              {/* Optional Execution Price */}
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">
                  LIMIT / EXECUTION PRICE (OPTIONAL, BLANK FOR MARKET)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Market Price"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="term-input"
                />
              </div>

              {/* Order Confirmation CTA */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="term-btn-secondary flex-1 py-2 text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="term-btn-primary flex-1 py-2 text-xs font-bold"
                >
                  {submitting ? 'EXECUTING...' : `CONFIRM ${orderType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
