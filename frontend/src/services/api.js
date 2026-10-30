/**
 * Central API Client for Stock Market AI Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
  // Authentication
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email: username, password }),
    });
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getMe(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    return res.ok ? res.json() : null;
  },

  // Stocks
  async getStocks() {
    const res = await fetch(`${API_BASE}/stocks`);
    if (!res.ok) throw new Error('Failed to fetch stocks');
    return res.json();
  },

  async getStockInfo(symbol) {
    const res = await fetch(`${API_BASE}/stocks/${symbol}`);
    if (!res.ok) throw new Error(`Failed to fetch info for ${symbol}`);
    return res.json();
  },

  // Market History
  async getMarketHistory(symbol, period = '1y', interval = '1d') {
    const res = await fetch(`${API_BASE}/market/history/${symbol}?period=${period}&interval=${interval}`);
    if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}`);
    return res.json();
  },

  // AI Predictions
  async getPredictions(symbol, horizon = 7, model = 'ensemble') {
    const res = await fetch(`${API_BASE}/predictions/${symbol}?horizon=${horizon}&model=${model}`);
    if (!res.ok) throw new Error(`Prediction error for ${symbol}`);
    return res.json();
  },

  // Financial Risk
  async getRiskMetrics(symbol) {
    const res = await fetch(`${API_BASE}/risk/${symbol}`);
    if (!res.ok) throw new Error(`Risk calculation failed for ${symbol}`);
    return res.json();
  },

  async calculatePortfolioRisk(holdings) {
    const res = await fetch(`${API_BASE}/risk/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdings }),
    });
    if (!res.ok) throw new Error('Failed to evaluate portfolio risk');
    return res.json();
  },

  // Portfolio
  async getPortfolio(id = 'default-demo-portfolio') {
    const res = await fetch(`${API_BASE}/portfolio/${id}`);
    if (!res.ok) throw new Error('Failed to retrieve portfolio');
    return res.json();
  },

  async addPosition(id, symbol, quantity, buyPrice) {
    const res = await fetch(`${API_BASE}/portfolio/${id}/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, quantity, buy_price: buyPrice }),
    });
    if (!res.ok) throw new Error('Failed to add position');
    return res.json();
  },

  async removePosition(id, symbol, quantity) {
    const url = quantity
      ? `${API_BASE}/portfolio/${id}/positions/${symbol}?quantity=${quantity}`
      : `${API_BASE}/portfolio/${id}/positions/${symbol}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove position');
    return res.json();
  },

  // Watchlist
  async getWatchlist() {
    const res = await fetch(`${API_BASE}/watchlist`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },

  async addToWatchlist(symbol) {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw new Error('Failed to add to watchlist');
    return res.json();
  },

  async removeFromWatchlist(symbol) {
    const res = await fetch(`${API_BASE}/watchlist/${symbol}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove from watchlist');
    return res.json();
  },

  // Sentiment
  async getSentiment(symbol) {
    const res = await fetch(`${API_BASE}/sentiment/${symbol}`);
    if (!res.ok) throw new Error(`Failed to fetch sentiment for ${symbol}`);
    return res.json();
  },
};
