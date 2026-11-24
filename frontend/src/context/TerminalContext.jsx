import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

const TerminalContext = createContext(null);

export const useTerminal = () => {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return ctx;
};

const normalizeWatchlist = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === 'string') {
      return {
        symbol: item,
        name: `${item} Corp`,
        current_price: 150.0,
        previous_close: 148.0,
        sector: 'Equities',
      };
    }
    return item;
  });
};

export const TerminalProvider = ({ children }) => {
  // Global Market Selection
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1y');
  const [selectedHorizon, setSelectedHorizon] = useState(7);
  const [selectedModel, setSelectedModel] = useState('ensemble');

  // Backend connection
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [apiLatency, setApiLatency] = useState(null);

  // Core Data States
  const [availableStocks, setAvailableStocks] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Auth States
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('alpha_jwt_token') || '');
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Loading States
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingPred, setLoadingPred] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [predError, setPredError] = useState(null);

  // 1. Backend Connectivity & Health Check
  const checkBackendHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const online = await apiClient.checkHealth();
      const end = performance.now();
      setIsBackendOnline(online);
      setApiLatency(Math.round(end - start));
    } catch {
      setIsBackendOnline(false);
      setApiLatency(null);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const timer = setInterval(checkBackendHealth, 20000);
    return () => clearInterval(timer);
  }, [checkBackendHealth]);

  // 2. Initial Platform Initialization (Stocks Universe, Current User, Portfolio, Watchlist)
  useEffect(() => {
    let active = true;

    async function initPlatform() {
      setLoadingStocks(true);
      try {
        const stocks = await apiClient.getStocks();
        if (active && stocks && stocks.length > 0) {
          setAvailableStocks(stocks);
        }
      } catch (err) {
        console.error('Failed to load stock universe:', err);
      } finally {
        if (active) setLoadingStocks(false);
      }

      if (token) {
        try {
          const u = await apiClient.getMe(token);
          if (active && u) setUser(u);
        } catch {
          // Token expired or invalid
        }
      }

      setLoadingPortfolio(true);
      try {
        const [port, wl] = await Promise.all([
          apiClient.getPortfolio(null, token),
          apiClient.getWatchlist(token),
        ]);
        if (active) {
          if (port) setPortfolioData(port);
          if (wl) setWatchlist(normalizeWatchlist(wl));
        }
      } catch (err) {
        console.error('Failed to load portfolio/watchlist:', err);
      } finally {
        if (active) setLoadingPortfolio(false);
      }
    }

    initPlatform();
    return () => { active = false; };
  }, [token]);

  // 3. Load Market History, Risk Metrics, and Sentiment when selectedSymbol or period changes
  const loadSymbolData = useCallback(async (sym, per) => {
    setLoadingHistory(true);
    setLoadingRisk(true);
    setLoadingSentiment(true);
    setHistoryError(null);

    try {
      const [hist, risk, sent] = await Promise.all([
        apiClient.getMarketHistory(sym, per),
        apiClient.getRiskMetrics(sym),
        apiClient.getSentiment(sym),
      ]);
      setHistoryData(hist);
      setRiskData(risk);
      setSentimentData(sent);
    } catch (err) {
      console.error(`Error loading data for ${sym}:`, err);
      setHistoryError(err?.message || 'Failed to retrieve market records');
    } finally {
      setLoadingHistory(false);
      setLoadingRisk(false);
      setLoadingSentiment(false);
    }
  }, []);

  useEffect(() => {
    loadSymbolData(selectedSymbol, period);
  }, [selectedSymbol, period, loadSymbolData]);

  // 4. Load AI Predictions when symbol, horizon, or model changes
  const loadPredictions = useCallback(async (sym, hor, mod) => {
    setLoadingPred(true);
    setPredError(null);
    try {
      const pred = await apiClient.getPredictions(sym, hor, mod);
      setPredictionData(pred);
    } catch (err) {
      console.error('Prediction load error:', err);
      setPredError(err?.message || 'Failed to fetch AI forecasts');
    } finally {
      setLoadingPred(false);
    }
  }, []);

  useEffect(() => {
    loadPredictions(selectedSymbol, selectedHorizon, selectedModel);
  }, [selectedSymbol, selectedHorizon, selectedModel, loadPredictions]);

  // Portfolio Operations
  const addPosition = async (sym, qty, price) => {
    try {
      const updated = await apiClient.addPosition(
        portfolioData?.portfolio_id || 'default-demo-portfolio',
        sym,
        qty,
        price,
        token
      );
      setPortfolioData(updated);
      return updated;
    } catch (err) {
      console.warn('Add position fallback:', err);
      const cur = portfolioData || { positions: [], cash: 25000, total_portfolio_value: 125000 };
      const pos = [...(cur.positions || [])];
      const existingIdx = pos.findIndex((p) => p.symbol === sym);
      const cost = (price || 150.0) * qty;
      if (existingIdx >= 0) {
        pos[existingIdx] = {
          ...pos[existingIdx],
          shares: pos[existingIdx].shares + qty,
          total_invested: (pos[existingIdx].total_invested || cost) + cost,
          current_value: (pos[existingIdx].shares + qty) * (price || 150.0),
        };
      } else {
        pos.push({
          symbol: sym,
          shares: qty,
          average_buy_price: price || 150.0,
          total_invested: cost,
          current_price: price || 150.0,
          current_value: cost,
          unrealized_pnl: 0,
          allocation_pct: 10,
        });
      }
      const updatedMock = { ...cur, positions: pos };
      setPortfolioData(updatedMock);
      return updatedMock;
    }
  };

  const removePosition = async (sym, qty) => {
    try {
      const updated = await apiClient.removePosition(
        portfolioData?.portfolio_id || 'default-demo-portfolio',
        sym,
        qty,
        token
      );
      setPortfolioData(updated);
      return updated;
    } catch (err) {
      console.warn('Remove position fallback:', err);
      const cur = portfolioData || { positions: [] };
      const updatedMock = {
        ...cur,
        positions: (cur.positions || []).filter((p) => p.symbol !== sym),
      };
      setPortfolioData(updatedMock);
      return updatedMock;
    }
  };

  // Watchlist Operations
  const addToWatchlist = async (sym) => {
    try {
      const updated = await apiClient.addToWatchlist(sym, token);
      if (Array.isArray(updated) && updated.length > 0 && typeof updated[0] === 'string') {
        const fullWl = await apiClient.getWatchlist(token);
        setWatchlist(normalizeWatchlist(fullWl));
      } else if (Array.isArray(updated)) {
        setWatchlist(normalizeWatchlist(updated));
      } else {
        setWatchlist((prev) => {
          const exists = prev.some((s) => (typeof s === 'string' ? s : s.symbol) === sym);
          if (exists) return prev;
          return [...prev, { symbol: sym, name: `${sym} Equity`, current_price: 185.0, previous_close: 182.0, sector: 'Equities' }];
        });
      }
    } catch (err) {
      console.warn('Add to watchlist fallback:', err);
      setWatchlist((prev) => {
        const exists = prev.some((s) => (typeof s === 'string' ? s : s.symbol) === sym);
        if (exists) return prev;
        return [...prev, { symbol: sym, name: `${sym} Equity`, current_price: 185.0, previous_close: 182.0, sector: 'Equities' }];
      });
    }
  };

  const removeFromWatchlist = async (sym) => {
    try {
      const updated = await apiClient.removeFromWatchlist(sym, token);
      if (Array.isArray(updated) && updated.length > 0 && typeof updated[0] === 'string') {
        const fullWl = await apiClient.getWatchlist(token);
        setWatchlist(normalizeWatchlist(fullWl));
      } else if (Array.isArray(updated)) {
        setWatchlist(normalizeWatchlist(updated));
      } else {
        setWatchlist((prev) => prev.filter((s) => (typeof s === 'string' ? s : s.symbol) !== sym));
      }
    } catch (err) {
      console.warn('Remove from watchlist fallback:', err);
      setWatchlist((prev) => prev.filter((s) => (typeof s === 'string' ? s : s.symbol) !== sym));
    }
  };

  // Auth Operations
  const login = async (username, password) => {
    const res = await apiClient.login(username, password);
    if (res?.access_token) {
      localStorage.setItem('alpha_jwt_token', res.access_token);
      setToken(res.access_token);
      apiClient.setToken(res.access_token);
    }
    setUser(res.user);
    setIsGuestMode(false);
    return res;
  };

  const oauthLogin = async (provider, profileData) => {
    const res = await apiClient.oauthLogin(provider, profileData);
    if (res?.access_token) {
      localStorage.setItem('alpha_jwt_token', res.access_token);
      setToken(res.access_token);
      apiClient.setToken(res.access_token);
    }
    setUser(res.user);
    setIsGuestMode(false);
    return res;
  };

  const register = async (userData) => {
    const res = await apiClient.register(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('alpha_jwt_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    apiClient.setToken('');
    setUser(null);
    setIsGuestMode(false);
  };

  const setGuestMode = () => {
    setIsGuestMode(true);
    setUser({
      id: 'guest-researcher',
      username: 'guest_quant',
      full_name: 'Guest Quant Researcher',
      email: 'quant@alphaquant.terminal',
    });
  };

  const changeSymbol = (newSymbol) => {
    if (!newSymbol) return;
    const clean = newSymbol.trim().toUpperCase();
    setSelectedSymbol(clean);
  };

  const refreshMarket = () => {
    loadSymbolData(selectedSymbol, period);
    loadPredictions(selectedSymbol, selectedHorizon, selectedModel);
  };

  const value = {
    selectedSymbol,
    changeSymbol,
    period,
    setPeriod,
    selectedHorizon,
    setSelectedHorizon,
    selectedModel,
    setSelectedModel,
    isBackendOnline,
    apiLatency,
    availableStocks,
    historyData,
    predictionData,
    riskData,
    sentimentData,
    portfolioData,
    watchlist,
    user,
    token,
    isGuestMode,
    setGuestMode,
    loadingStocks,
    loadingHistory,
    loadingPred,
    loadingRisk,
    loadingSentiment,
    loadingPortfolio,
    historyError,
    predError,
    addPosition,
    removePosition,
    addToWatchlist,
    removeFromWatchlist,
    login,
    oauthLogin,
    register,
    logout,
    refreshMarket,
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};
