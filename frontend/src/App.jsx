import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketTickerBar } from './components/MarketTickerBar';
import { CandlestickChart } from './components/CandlestickChart';
import { PredictionPanel } from './components/PredictionPanel';
import { RiskDashboard } from './components/RiskDashboard';
import { PortfolioManager } from './components/PortfolioManager';
import { SentimentViewer } from './components/SentimentViewer';
import { WatchlistModal } from './components/WatchlistModal';
import { AuthModal } from './components/AuthModal';
import { apiClient } from './services/api';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Info } from 'lucide-react';

/* ── Small header strip showing current stock quick-stats ── */
const StockInfoStrip = ({ symbol, historyData, loading }) => {
  const records = historyData?.data || [];
  const latest = records[records.length - 1];
  const prev   = records[records.length - 2];

  if (!latest) return null;

  const chg    = prev ? latest.close - prev.close : 0;
  const chgPct = prev ? ((chg / prev.close) * 100).toFixed(2) : '0.00';
  const isUp   = chg >= 0;

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-[#090d16]/70 border-b border-white/5 text-xs font-mono backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="font-bold text-white text-sm">{symbol}</span>
        <span className="font-black text-white">${latest.close?.toFixed(2)}</span>
        <span className={`flex items-center gap-0.5 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {isUp ? '+' : ''}{chgPct}%
        </span>
      </div>
      <span className="text-slate-600 hidden sm:block">|</span>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 hidden sm:flex">
        <span>Open: <strong className="text-slate-200">${latest.open?.toFixed(2)}</strong></span>
        <span>High: <strong className="text-emerald-400">${latest.high?.toFixed(2)}</strong></span>
        <span>Low: <strong className="text-rose-400">${latest.low?.toFixed(2)}</strong></span>
        <span>Vol: <strong className="text-slate-200">{latest.volume?.toLocaleString()}</strong></span>
        {latest.rsi_14 && <span>RSI: <strong className={`${latest.rsi_14 > 70 ? 'text-rose-400' : latest.rsi_14 < 30 ? 'text-emerald-400' : 'text-slate-200'}`}>{latest.rsi_14?.toFixed(1)}</strong></span>}
      </div>
    </div>
  );
};

export function App() {
  const [activeTab, setActiveTab] = useState('technicals');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1y');
  const [selectedHorizon, setSelectedHorizon] = useState(7);
  const [selectedModel, setSelectedModel] = useState('ensemble');

  // Backend connection status
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Data states
  const [availableStocks, setAvailableStocks] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Modals & User Auth
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('alpha_jwt_token') || '');

  // Loading indicators
  const [loading, setLoading] = useState(false);
  const [predLoading, setPredLoading] = useState(false);

  // 1. Check Backend Connectivity
  useEffect(() => {
    async function checkStatus() {
      const online = await apiClient.checkHealth();
      setIsBackendOnline(online);
    }
    checkStatus();
    const timer = setInterval(checkStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  // 2. Initial Platform Initialization
  useEffect(() => {
    async function initPlatform() {
      try {
        const stocks = await apiClient.getStocks();
        if (stocks && stocks.length > 0) setAvailableStocks(stocks);
      } catch (err) {
        console.error('Stock list error:', err);
      }

      if (token) {
        try {
          const u = await apiClient.getMe(token);
          if (u) setUser(u);
        } catch {
          // expired — user stays logged out
        }
      }

      try {
        const [port, wl] = await Promise.all([
          apiClient.getPortfolio(),
          apiClient.getWatchlist(),
        ]);
        if (port) setPortfolioData(port);
        if (wl)   setWatchlist(wl);
      } catch (err) {
        console.error('Portfolio/Watchlist init error:', err);
      }
    }
    initPlatform();
  }, [token]);

  // 3. Load stock-specific data whenever symbol or period changes
  useEffect(() => {
    let cancelled = false;
    async function loadStockData() {
      setLoading(true);
      try {
        const [hist, risk, sent] = await Promise.all([
          apiClient.getMarketHistory(selectedSymbol, period),
          apiClient.getRiskMetrics(selectedSymbol),
          apiClient.getSentiment(selectedSymbol),
        ]);
        if (!cancelled) {
          setHistoryData(hist);
          setRiskData(risk);
          setSentimentData(sent);
        }
      } catch (err) {
        console.error('Stock data error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadStockData();
    return () => { cancelled = true; };
  }, [selectedSymbol, period]);

  // 4. Load AI Predictions whenever symbol / horizon / model changes
  useEffect(() => {
    let cancelled = false;
    async function loadPredictions() {
      setPredLoading(true);
      try {
        const pred = await apiClient.getPredictions(selectedSymbol, selectedHorizon, selectedModel);
        if (!cancelled) setPredictionData(pred);
      } catch (err) {
        console.error('Prediction error:', err);
      } finally {
        if (!cancelled) setPredLoading(false);
      }
    }
    loadPredictions();
    return () => { cancelled = true; };
  }, [selectedSymbol, selectedHorizon, selectedModel]);

  /* ── Handlers ── */
  const handleAddPosition = async (sym, qty, price) => {
    try {
      const updated = await apiClient.addPosition(
        portfolioData?.portfolio_id || 'default-demo-portfolio',
        sym, qty, price
      );
      setPortfolioData(updated);
    } catch (err) { alert(`Add position failed: ${err.message}`); }
  };

  const handleRemovePosition = async (sym, qty) => {
    try {
      const updated = await apiClient.removePosition(
        portfolioData?.portfolio_id || 'default-demo-portfolio',
        sym, qty
      );
      setPortfolioData(updated);
    } catch (err) { alert(`Remove position failed: ${err.message}`); }
  };

  const handleAddToWatchlist = async (sym) => {
    try {
      const updated = await apiClient.addToWatchlist(sym);
      setWatchlist(Array.isArray(updated) ? updated : watchlist);
    } catch (err) { alert(`Watchlist add failed: ${err.message}`); }
  };

  const handleRemoveFromWatchlist = async (sym) => {
    try {
      const updated = await apiClient.removeFromWatchlist(sym);
      setWatchlist(Array.isArray(updated) ? updated : watchlist.filter(s => s.symbol !== sym));
    } catch (err) { alert(`Watchlist remove failed: ${err.message}`); }
  };

  const handleLogin = async (usr, pwd) => {
    const res = await apiClient.login(usr, pwd);
    localStorage.setItem('alpha_jwt_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const handleRegister = async (data) => {
    await apiClient.register(data);
    await handleLogin(data.username, data.password);
  };

  const handleLogout = () => {
    localStorage.removeItem('alpha_jwt_token');
    setToken('');
    setUser(null);
  };

  const handleRefreshPredictions = async () => {
    setPredictionData(null);
    setPredLoading(true);
    try {
      const pred = await apiClient.getPredictions(selectedSymbol, selectedHorizon, selectedModel);
      setPredictionData(pred);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setPredLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-[#e2e8f0] selection:bg-cyan-500/30 selection:text-white">

      {/* ── Ambient Background Glow Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-60 -left-40 w-[520px] h-[520px] bg-cyan-500/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 -right-60 w-[480px] h-[480px] bg-indigo-600/8 rounded-full blur-[160px]" />
        <div className="absolute -bottom-60 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px]" />
      </div>

      {/* ── Scrolling Market Ticker Bar ── */}
      <MarketTickerBar availableStocks={availableStocks} />

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-16">

        {/* Sticky Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
          popularStocks={availableStocks}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          isBackendOnline={isBackendOnline}
        />

        {/* Stock Quick-Stats Strip (visible on chart & other tabs) */}
        {historyData && (
          <div className="glass-card mb-4 overflow-hidden">
            <StockInfoStrip symbol={selectedSymbol} historyData={historyData} loading={loading} />
          </div>
        )}

        {/* Loading skeleton shimmer (on initial load) */}
        {loading && !historyData && (
          <div className="glass-card mb-4 p-6 flex items-center gap-4 text-slate-400 font-mono text-sm">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span>Fetching market data for <strong className="text-cyan-400">{selectedSymbol}</strong>…</span>
          </div>
        )}

        {/* ── Dynamic Tab Content ── */}
        <main>
          {activeTab === 'technicals' && (
            <CandlestickChart
              historyData={historyData}
              symbol={selectedSymbol}
              period={period}
              setPeriod={setPeriod}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictionPanel
              predictionData={predictionData}
              selectedHorizon={selectedHorizon}
              setSelectedHorizon={setSelectedHorizon}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              onRefresh={handleRefreshPredictions}
              loading={predLoading}
            />
          )}

          {activeTab === 'risk' && (
            <RiskDashboard riskData={riskData} symbol={selectedSymbol} />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioManager
              portfolio={portfolioData}
              onAddPosition={handleAddPosition}
              onRemovePosition={handleRemovePosition}
              availableStocks={availableStocks}
            />
          )}

          {activeTab === 'sentiment' && (
            <SentimentViewer sentimentData={sentimentData} symbol={selectedSymbol} />
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="mt-14 pt-5 border-t border-white/5 text-center space-y-1.5">
          <p className="text-xs font-mono text-slate-500">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold">ALPHAQUANT AI</span>
            {' '}• Quantitative Financial Analytics & Deep Learning Price Forecasting Platform
          </p>
          <p className="text-[11px] text-slate-600 font-mono max-w-lg mx-auto">
            All price forecasts, risk metrics, and sentiment scores are experimental AI outputs for research &amp; educational purposes only.
            Not financial or investment advice.
          </p>
        </footer>
      </div>

      {/* ── Global Modals ── */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onSelectStock={setSelectedSymbol}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
