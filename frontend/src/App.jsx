import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CandlestickChart } from './components/CandlestickChart';
import { PredictionPanel } from './components/PredictionPanel';
import { RiskDashboard } from './components/RiskDashboard';
import { PortfolioManager } from './components/PortfolioManager';
import { SentimentViewer } from './components/SentimentViewer';
import { WatchlistModal } from './components/WatchlistModal';
import { AuthModal } from './components/AuthModal';
import { apiClient } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('technicals');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1y');
  const [selectedHorizon, setSelectedHorizon] = useState(7);
  const [selectedModel, setSelectedModel] = useState('ensemble');

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

  // Loading indicator
  const [loading, setLoading] = useState(false);
  const [predLoading, setPredLoading] = useState(false);

  // 1. Initial Load: Stocks list & user session
  useEffect(() => {
    async function initPlatform() {
      try {
        const stocks = await apiClient.getStocks();
        setAvailableStocks(stocks);
      } catch (err) {
        console.error('Error fetching stock list:', err);
      }

      if (token) {
        try {
          const u = await apiClient.getMe(token);
          if (u) setUser(u);
        } catch (err) {
          console.warn('Session expired');
        }
      }

      // Load initial portfolio & watchlist
      try {
        const port = await apiClient.getPortfolio();
        setPortfolioData(port);
        const wl = await apiClient.getWatchlist();
        setWatchlist(wl);
      } catch (err) {
        console.error('Error loading user assets:', err);
      }
    }
    initPlatform();
  }, [token]);

  // 2. Fetch Stock-Specific Data on Symbol or Period Change
  useEffect(() => {
    async function loadStockDetails() {
      setLoading(true);
      try {
        // Fetch historical OHLCV candles
        const hist = await apiClient.getMarketHistory(selectedSymbol, period);
        setHistoryData(hist);

        // Fetch Risk Metrics
        const risk = await apiClient.getRiskMetrics(selectedSymbol);
        setRiskData(risk);

        // Fetch Market Sentiment
        const sent = await apiClient.getSentiment(selectedSymbol);
        setSentimentData(sent);
      } catch (err) {
        console.error('Error loading stock datasets:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStockDetails();
  }, [selectedSymbol, period]);

  // 3. Fetch AI Predictions when symbol, horizon, or model changes
  useEffect(() => {
    async function loadPredictions() {
      setPredLoading(true);
      try {
        const pred = await apiClient.getPredictions(selectedSymbol, selectedHorizon, selectedModel);
        setPredictionData(pred);
      } catch (err) {
        console.error('Error fetching AI predictions:', err);
      } finally {
        setPredLoading(false);
      }
    }
    loadPredictions();
  }, [selectedSymbol, selectedHorizon, selectedModel]);

  // Handlers for Portfolio
  const handleAddPosition = async (sym, qty, price) => {
    try {
      const updated = await apiClient.addPosition(portfolioData?.portfolio_id || 'default-demo-portfolio', sym, qty, price);
      setPortfolioData(updated);
    } catch (err) {
      alert(`Could not add position: ${err.message}`);
    }
  };

  const handleRemovePosition = async (sym, qty) => {
    try {
      const updated = await apiClient.removePosition(portfolioData?.portfolio_id || 'default-demo-portfolio', sym, qty);
      setPortfolioData(updated);
    } catch (err) {
      alert(`Could not remove position: ${err.message}`);
    }
  };

  // Handlers for Watchlist
  const handleAddToWatchlist = async (sym) => {
    try {
      await apiClient.addToWatchlist(sym);
      const wl = await apiClient.getWatchlist();
      setWatchlist(wl);
    } catch (err) {
      alert(`Could not add to watchlist: ${err.message}`);
    }
  };

  const handleRemoveFromWatchlist = async (sym) => {
    try {
      await apiClient.removeFromWatchlist(sym);
      const wl = await apiClient.getWatchlist();
      setWatchlist(wl);
    } catch (err) {
      alert(`Could not remove from watchlist: ${err.message}`);
    }
  };

  // Handlers for Auth
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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        popularStocks={availableStocks}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Dynamic Workspace Panel */}
      <main className="transition-all duration-300">
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
            onRefresh={() => {
              setPredictionData(null);
              apiClient.getPredictions(selectedSymbol, selectedHorizon, selectedModel).then(setPredictionData);
            }}
            loading={predLoading}
          />
        )}

        {activeTab === 'risk' && (
          <RiskDashboard
            riskData={riskData}
            symbol={selectedSymbol}
          />
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
          <SentimentViewer
            sentimentData={sentimentData}
            symbol={selectedSymbol}
          />
        )}
      </main>

      {/* Watchlist Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onSelectStock={setSelectedSymbol}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
      />

      {/* Auth Modal */}
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
