import React, { useState, useEffect, useCallback } from 'react';
import { CandlestickChart } from './CandlestickChart';
import { apiClient } from '../services/api';
import {
  AlertTriangle,
  RefreshCw,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

export const StockDashboard = ({
  symbol = 'AAPL',
  period = '1y',
  setPeriod,
  historyData: externalData,
  loading: externalLoading,
  error: externalError,
  onRetry: externalOnRetry,
}) => {
  const [internalData, setInternalData] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  // Determine active states
  const activeData = externalData !== undefined ? externalData : internalData;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  const activeError = externalError !== undefined ? externalError : internalError;

  // Data fetching with error catching
  const fetchStockData = useCallback(async () => {
    if (externalOnRetry) {
      externalOnRetry();
      return;
    }
    setInternalLoading(true);
    setInternalError(null);
    try {
      const data = await apiClient.getMarketHistory(symbol, period);
      setInternalData(data);
    } catch (err) {
      console.error('StockDashboard fetch error:', err);
      setInternalError(
        err?.message || 'Failed to fetch market data from the backend. The service may be throttled or temporarily unreachable.'
      );
    } finally {
      setInternalLoading(false);
    }
  }, [symbol, period, externalOnRetry]);

  // Initial internal fetch if no external data or external handlers provided
  useEffect(() => {
    if (externalData === undefined && !externalLoading) {
      fetchStockData();
    }
  }, [symbol, period, externalData, externalLoading, fetchStockData]);

  // Error Card UI
  if (activeError && !isLoading) {
    return (
      <div className="glass-card p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 border border-rose-500/30 bg-[#090d16]/90 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-bold text-white font-mono tracking-tight">
            Market Data Feed Throttled or Unavailable
          </h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            {activeError}
          </p>
        </div>
        <button
          onClick={fetchStockData}
          className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Market Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CandlestickChart
        historyData={activeData}
        symbol={symbol}
        period={period}
        setPeriod={setPeriod}
        error={activeError}
        onRetry={fetchStockData}
      />
    </div>
  );
};

export default StockDashboard;

