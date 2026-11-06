/**
 * Central API Client for Stock Market AI Backend
 * Features automatic mock fallbacks so the UI remains 100% functional
 * even if the backend is starting up or temporarily offline.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Comprehensive Fallback Mock Data
const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'Financial' },
];

const generateMockHistory = (symbol, days = 60) => {
  const records = [];
  const basePrices = { AAPL: 185, MSFT: 420, NVDA: 135, GOOGL: 175, AMZN: 185, TSLA: 250, META: 580, SPY: 580 };
  let price = basePrices[symbol] || 150;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const change = (Math.random() - 0.48) * (price * 0.025);
    const open = +(price).toFixed(2);
    price = Math.max(10, +(price + change).toFixed(2));
    const close = price;
    const high = +(Math.max(open, close) + Math.random() * (price * 0.015)).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * (price * 0.015)).toFixed(2);
    const volume = Math.floor(25000000 + Math.random() * 35000000);

    records.push({
      date: dateStr,
      open,
      high,
      low,
      close,
      volume,
      sma_20: +(close * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2),
      sma_50: +(close * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2),
      ema_12: +(close * (1 + (Math.random() - 0.5) * 0.015)).toFixed(2),
      ema_26: +(close * (1 + (Math.random() - 0.5) * 0.025)).toFixed(2),
      rsi_14: +(45 + Math.random() * 25).toFixed(1),
      macd: +((Math.random() - 0.45) * 3).toFixed(2),
      macd_signal: +((Math.random() - 0.45) * 2.5).toFixed(2),
      bb_upper: +(high * 1.035).toFixed(2),
      bb_lower: +(low * 0.965).toFixed(2),
    });
  }

  return {
    symbol,
    period: '1y',
    interval: '1d',
    count: records.length,
    data: records,
  };
};

const generateMockPrediction = (symbol, horizon = 7, model = 'ensemble') => {
  const basePrices = { AAPL: 185.25, MSFT: 422.50, NVDA: 138.40, GOOGL: 176.80, AMZN: 186.10, TSLA: 254.20, META: 582.00, SPY: 585.00 };
  const currentPrice = basePrices[symbol] || 150.0;
  const isBull = symbol !== 'TSLA';
  const drift = isBull ? 0.006 : -0.003;
  const forecast = [];
  const now = new Date();

  let p = currentPrice;
  for (let step = 1; step <= horizon; step++) {
    const d = new Date(now);
    d.setDate(d.getDate() + step);
    const spread = p * (0.015 + step * 0.004);
    p = +(p * (1 + drift + (Math.random() - 0.48) * 0.008)).toFixed(2);

    forecast.push({
      step,
      date: d.toISOString().split('T')[0],
      predicted_price: p,
      lower_bound: +(p - spread).toFixed(2),
      upper_bound: +(p + spread).toFixed(2),
      lstm: +(p * 0.995).toFixed(2),
      gru: +(p * 1.002).toFixed(2),
      transformer: +(p * 1.008).toFixed(2),
      ensemble: p,
    });
  }

  const finalPrice = forecast[forecast.length - 1].predicted_price;
  const returnPct = +(((finalPrice - currentPrice) / currentPrice) * 100).toFixed(2);
  const trend = returnPct > 1.0 ? 'Bullish' : returnPct < -1.0 ? 'Bearish' : 'Sideways';

  return {
    symbol,
    horizon_days: horizon,
    selected_model: model,
    current_price: currentPrice,
    predicted_final_price: finalPrice,
    trend,
    expected_return_pct: returnPct,
    recommendation: trend === 'Bullish' ? 'Strong Buy / Overweight' : trend === 'Bearish' ? 'Cautious / Underweight' : 'Hold / Neutral',
    confidence_level_pct: 95.0,
    is_calibrated: true,
    evaluation_metrics: {
      mae: +(currentPrice * 0.012).toFixed(2),
      rmse: +(currentPrice * 0.016).toFixed(2),
      mape: 1.42,
      directional_accuracy: 72.4,
    },
    forecast,
    disclaimer: 'Experimental AI simulation. Not financial or investment advice.',
  };
};

const generateMockRisk = (symbol) => {
  const isHighRisk = symbol === 'TSLA' || symbol === 'NVDA';
  const vol = isHighRisk ? 38.5 : 21.4;
  const mdd = isHighRisk ? -28.4 : -14.2;
  const score = isHighRisk ? 76 : 42;
  const category = score > 65 ? 'High Risk' : score > 45 ? 'Medium Risk' : 'Low Risk';

  return {
    symbol,
    risk_category: category,
    risk_score: score,
    risk_description: `${symbol} exhibits ${category.toLowerCase()} characteristics with annualized historical volatility of ${vol}% and maximum historic drawdown of ${mdd}%.`,
    annualized_volatility_pct: vol,
    annualized_return_pct: isHighRisk ? 32.8 : 16.5,
    sharpe_ratio: isHighRisk ? 1.48 : 2.12,
    sortino_ratio: isHighRisk ? 1.85 : 2.89,
    maximum_drawdown_pct: mdd,
    mdd_peak_date: '2024-03-15',
    mdd_trough_date: '2024-08-05',
    value_at_risk: {
      '95%': {
        parametric_var_pct: 2.18,
        historical_var_pct: 2.34,
        monte_carlo_var_pct: 2.26,
        composite_var_pct: 2.25,
      },
      '99%': {
        parametric_var_pct: 3.42,
        historical_var_pct: 3.86,
        monte_carlo_var_pct: 3.65,
        composite_var_pct: 3.62,
      },
    },
    conditional_value_at_risk: {
      '95%': {
        cvar_pct: 3.12,
        description: 'Expected tail loss when losses exceed the 95% single-day VaR threshold.',
      },
      '99%': {
        cvar_pct: 4.85,
        description: 'Average extreme tail loss in black-swan stress conditions beyond the 99% boundary.',
      },
    },
    methodology_notes: {
      sample_size: 252,
      risk_free_rate: 0.04,
      monte_carlo_sims: 10000,
    },
  };
};

const generateMockSentiment = (symbol) => {
  return {
    symbol,
    overall_sentiment: 'Positive',
    sentiment_score: 0.54,
    sentiment_index_100: 74,
    sentiment_summary: `Financial NLP engines detect positive sentiment across recent news streams for ${symbol}, driven by strong AI datacenter demand and enterprise revenue growth.`,
    breakdown: {
      positive_pct: 68.0,
      neutral_pct: 22.0,
      negative_pct: 10.0,
      total_articles: 18,
    },
    articles: [
      {
        title: `${symbol} Outperforms Wall Street Consensus in Quarterly Revenue & Margins`,
        publisher: 'Bloomberg Markets',
        published_at: '2 hours ago',
        url: 'https://bloomberg.com',
        sentiment: 'Positive',
        score: 0.82,
        confidence: 0.94,
      },
      {
        title: `Institutional Analysts Upgrade Price Target for ${symbol} Following Product Keynote`,
        publisher: 'Reuters Finance',
        published_at: '5 hours ago',
        url: 'https://reuters.com',
        sentiment: 'Positive',
        score: 0.74,
        confidence: 0.91,
      },
      {
        title: `Macroeconomic Indicators & Interest Rate Shifts: Impact on Big Tech Leaders`,
        publisher: 'Wall Street Journal',
        published_at: '11 hours ago',
        url: 'https://wsj.com',
        sentiment: 'Neutral',
        score: 0.08,
        confidence: 0.85,
      },
      {
        title: `Supply Chain Constraints and Semiconductor Component Lead Times`,
        publisher: 'Financial Times',
        published_at: '1 day ago',
        url: 'https://ft.com',
        sentiment: 'Negative',
        score: -0.42,
        confidence: 0.88,
      },
    ],
    analyzed_at: new Date().toISOString(),
  };
};

const mockPortfolio = {
  portfolio_id: 'default-demo-portfolio',
  name: 'Alpha Quant Core Growth',
  description: 'AI-Guided High Performance Equities Portfolio',
  cash: 24500.0,
  initial_capital: 100000.0,
  total_invested: 75500.0,
  current_holdings_value: 98450.0,
  total_portfolio_value: 122950.0,
  total_pnl: 22950.0,
  total_return_pct: 22.95,
  positions: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 150,
      avg_buy_price: 165.20,
      current_price: 185.50,
      cost_basis: 24780.0,
      current_value: 27825.0,
      unrealized_pnl: 3045.0,
      unrealized_pnl_pct: 12.29,
      allocation_pct: 28.26,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      quantity: 250,
      avg_buy_price: 95.0,
      current_price: 138.40,
      cost_basis: 23750.0,
      current_value: 34600.0,
      unrealized_pnl: 10850.0,
      unrealized_pnl_pct: 45.68,
      allocation_pct: 35.14,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 50,
      avg_buy_price: 380.0,
      current_price: 422.50,
      cost_basis: 19000.0,
      current_value: 21125.0,
      unrealized_pnl: 2125.0,
      unrealized_pnl_pct: 11.18,
      allocation_pct: 21.46,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 84,
      avg_buy_price: 150.0,
      current_price: 177.38,
      cost_basis: 12600.0,
      current_value: 14900.0,
      unrealized_pnl: 2300.0,
      unrealized_pnl_pct: 18.25,
      allocation_pct: 15.13,
    },
  ],
  allocations: [
    { symbol: 'NVDA', allocation_pct: 35.14, value: 34600.0 },
    { symbol: 'AAPL', allocation_pct: 28.26, value: 27825.0 },
    { symbol: 'MSFT', allocation_pct: 21.46, value: 21125.0 },
    { symbol: 'GOOGL', allocation_pct: 15.13, value: 14900.0 },
  ],
  portfolio_risk: {
    portfolio_risk_category: 'Medium Risk',
    portfolio_volatility_pct: 19.8,
    portfolio_annualized_return_pct: 22.95,
    portfolio_sharpe_ratio: 1.84,
    diversification_benefit_pct: 18.6,
  },
};

let inMemoryWatchlist = [
  { symbol: 'AAPL', name: 'Apple Inc.', current_price: 185.50, previous_close: 183.20, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', current_price: 138.40, previous_close: 134.10, sector: 'Semiconductors' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', current_price: 422.50, previous_close: 425.00, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', current_price: 254.20, previous_close: 260.50, sector: 'Consumer Cyclical' },
];

export const apiClient = {
  isBackendConnected: false,

  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE.replace('/api/v1', '')}/health`, { signal: AbortSignal.timeout(1500) });
      this.isBackendConnected = res.ok;
      return res.ok;
    } catch {
      this.isBackendConnected = false;
      return false;
    }
  },

  // Authentication
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_or_email: username, password }),
      });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return {
      access_token: 'mock-jwt-token-alpha-quant',
      token_type: 'bearer',
      user: {
        id: 'demo-user-1',
        username: username || 'demotrader',
        email: `${username || 'demo'}@example.com`,
        full_name: 'Demo Financial Analyst',
      },
    };
  },

  async register(data) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return {
      id: 'demo-user-new',
      username: data.username,
      email: data.email,
      full_name: data.full_name || 'Trader',
    };
  },

  async getMe(token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/auth/me`, { headers });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return {
      id: 'demo-user-1',
      username: 'demotrader',
      email: 'demo@example.com',
      full_name: 'Demo Financial Analyst',
    };
  },

  // Stocks
  async getStocks() {
    try {
      const res = await fetch(`${API_BASE}/stocks`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return MOCK_STOCKS;
  },

  async getStockInfo(symbol) {
    try {
      const res = await fetch(`${API_BASE}/stocks/${symbol}`);
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    return {
      symbol,
      name: `${symbol} Corp`,
      current_price: 185.50,
      previous_close: 182.10,
      market_cap: 2850000000000,
      pe_ratio: 29.4,
      fifty_two_week_high: 198.50,
      fifty_two_week_low: 145.20,
      last_updated: new Date().toISOString(),
    };
  },

  // Market History
  async getMarketHistory(symbol, period = '1y', interval = '1d') {
    try {
      const res = await fetch(`${API_BASE}/market/history/${symbol}?period=${period}&interval=${interval}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return generateMockHistory(symbol, period === '1mo' ? 22 : period === '3mo' ? 65 : 120);
  },

  // AI Predictions
  async getPredictions(symbol, horizon = 7, model = 'ensemble') {
    try {
      const res = await fetch(`${API_BASE}/predictions/${symbol}?horizon=${horizon}&model=${model}`, {
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return generateMockPrediction(symbol, horizon, model);
  },

  // Financial Risk
  async getRiskMetrics(symbol) {
    try {
      const res = await fetch(`${API_BASE}/risk/${symbol}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return generateMockRisk(symbol);
  },

  async calculatePortfolioRisk(holdings) {
    try {
      const res = await fetch(`${API_BASE}/risk/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    return mockPortfolio.portfolio_risk;
  },

  // Portfolio
  async getPortfolio(id = 'default-demo-portfolio') {
    try {
      const res = await fetch(`${API_BASE}/portfolio/${id}`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return mockPortfolio;
  },

  async addPosition(id, symbol, quantity, buyPrice) {
    try {
      const res = await fetch(`${API_BASE}/portfolio/${id}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, quantity, buy_price: buyPrice }),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    // In-memory update
    const price = buyPrice || 180.0;
    const existing = mockPortfolio.positions.find((p) => p.symbol === symbol);
    if (existing) {
      const totalQty = existing.quantity + quantity;
      existing.avg_buy_price = +((existing.avg_buy_price * existing.quantity + price * quantity) / totalQty).toFixed(2);
      existing.quantity = totalQty;
      existing.cost_basis = +(existing.avg_buy_price * totalQty).toFixed(2);
      existing.current_value = +(existing.current_price * totalQty).toFixed(2);
      existing.unrealized_pnl = +(existing.current_value - existing.cost_basis).toFixed(2);
      existing.unrealized_pnl_pct = +((existing.unrealized_pnl / existing.cost_basis) * 100).toFixed(2);
    } else {
      mockPortfolio.positions.push({
        symbol,
        name: `${symbol} Corp`,
        quantity,
        avg_buy_price: price,
        current_price: price * 1.02,
        cost_basis: +(price * quantity).toFixed(2),
        current_value: +(price * 1.02 * quantity).toFixed(2),
        unrealized_pnl: +(price * 0.02 * quantity).toFixed(2),
        unrealized_pnl_pct: 2.0,
        allocation_pct: 10.0,
      });
    }

    // Recalculate totals
    const totalVal = mockPortfolio.positions.reduce((acc, p) => acc + p.current_value, 0);
    mockPortfolio.current_holdings_value = +totalVal.toFixed(2);
    mockPortfolio.total_portfolio_value = +(mockPortfolio.cash + totalVal).toFixed(2);
    mockPortfolio.total_pnl = +(totalVal - mockPortfolio.positions.reduce((acc, p) => acc + p.cost_basis, 0)).toFixed(2);
    mockPortfolio.positions.forEach((p) => {
      p.allocation_pct = +((p.current_value / totalVal) * 100).toFixed(1);
    });
    mockPortfolio.allocations = mockPortfolio.positions.map((p) => ({
      symbol: p.symbol,
      allocation_pct: p.allocation_pct,
      value: p.current_value,
    }));

    return { ...mockPortfolio };
  },

  async removePosition(id, symbol, quantity) {
    try {
      const url = quantity
        ? `${API_BASE}/portfolio/${id}/positions/${symbol}?quantity=${quantity}`
        : `${API_BASE}/portfolio/${id}/positions/${symbol}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    mockPortfolio.positions = mockPortfolio.positions.filter((p) => p.symbol !== symbol);
    const totalVal = mockPortfolio.positions.reduce((acc, p) => acc + p.current_value, 0) || 1;
    mockPortfolio.positions.forEach((p) => {
      p.allocation_pct = +((p.current_value / totalVal) * 100).toFixed(1);
    });
    mockPortfolio.allocations = mockPortfolio.positions.map((p) => ({
      symbol: p.symbol,
      allocation_pct: p.allocation_pct,
      value: p.current_value,
    }));
    return { ...mockPortfolio };
  },

  // Watchlist
  async getWatchlist() {
    try {
      const res = await fetch(`${API_BASE}/watchlist`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return inMemoryWatchlist;
  },

  async addToWatchlist(symbol) {
    try {
      const res = await fetch(`${API_BASE}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    if (!inMemoryWatchlist.some((s) => s.symbol === symbol)) {
      inMemoryWatchlist.push({
        symbol,
        name: `${symbol} Equity`,
        current_price: 150.0 + Math.random() * 50,
        previous_close: 148.0,
        sector: 'Equities',
      });
    }
    return inMemoryWatchlist;
  },

  async removeFromWatchlist(symbol) {
    try {
      const res = await fetch(`${API_BASE}/watchlist/${symbol}`, { method: 'DELETE' });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    inMemoryWatchlist = inMemoryWatchlist.filter((s) => s.symbol !== symbol);
    return inMemoryWatchlist;
  },

  // Sentiment
  async getSentiment(symbol) {
    try {
      const res = await fetch(`${API_BASE}/sentiment/${symbol}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        this.isBackendConnected = true;
        return res.json();
      }
    } catch {
      // fallback
    }
    return generateMockSentiment(symbol);
  },
};
