import React, { useState, useEffect } from 'react';
import {
  FileCode,
  ExternalLink,
  Play,
  Copy,
  Check,
  Server,
  Lock,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Terminal,
  Code2,
  Globe,
  Layers,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';

const API_ENDPOINTS = [
  {
    category: 'Health & System',
    endpoints: [
      {
        method: 'GET',
        path: '/',
        summary: 'Root System Health',
        desc: 'Returns system name, version, and server online confirmation.',
        auth: false,
        params: [],
        defaultPath: 'http://localhost:8000/',
      },
      {
        method: 'GET',
        path: '/health',
        summary: 'Microservices Diagnostic Ping',
        desc: 'Verifies database connectivity, memory status, and background tasks.',
        auth: false,
        params: [],
        defaultPath: 'http://localhost:8000/health',
      },
    ],
  },
  {
    category: 'Authentication',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        summary: 'OAuth2 Password Bearer Token',
        desc: 'Authenticates username and password and returns JWT access token.',
        auth: false,
        params: [
          { name: 'username', default: 'demotrader', type: 'string' },
          { name: 'password', default: 'demopass', type: 'password' },
        ],
        defaultPath: 'http://localhost:8000/api/v1/auth/login',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/register',
        summary: 'Register New Researcher',
        desc: 'Creates a new user profile with encrypted password hashing.',
        auth: false,
        params: [
          { name: 'username', default: 'new_quant', type: 'string' },
          { name: 'email', default: 'new_quant@alphaquant.terminal', type: 'string' },
          { name: 'password', default: 'securepass123', type: 'password' },
        ],
        defaultPath: 'http://localhost:8000/api/v1/auth/register',
      },
      {
        method: 'GET',
        path: '/api/v1/auth/me',
        summary: 'Current Authenticated User',
        desc: 'Returns the profile for the JWT Bearer token holder.',
        auth: true,
        params: [],
        defaultPath: 'http://localhost:8000/api/v1/auth/me',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/forgot-password',
        summary: 'Dispatch Recovery OTP',
        desc: 'Generates and emails a 6-digit verification code.',
        auth: false,
        params: [{ name: 'email', default: 'demo@example.com', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/auth/forgot-password',
      },
    ],
  },
  {
    category: 'Stocks Universe',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/stocks',
        summary: 'List Available Stock Universe',
        desc: 'Returns all monitored equity securities, sectors, and identifiers.',
        auth: false,
        params: [],
        defaultPath: 'http://localhost:8000/api/v1/stocks',
      },
      {
        method: 'GET',
        path: '/api/v1/stocks/{symbol}',
        summary: 'Stock Security Profile',
        desc: 'Fetches company name, sector, market cap, and 52-week price range.',
        auth: false,
        params: [{ name: 'symbol', default: 'AAPL', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/stocks/AAPL',
      },
    ],
  },
  {
    category: 'Market History & Technicals',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/market/history/{symbol}',
        summary: 'Historical OHLCV Candle Streams',
        desc: 'Time-series bars enriched with SMA (20, 50), EMA, RSI, MACD, and Bollinger Bands.',
        auth: false,
        params: [
          { name: 'symbol', default: 'AAPL', type: 'string' },
          { name: 'period', default: '1y', type: 'string' },
          { name: 'interval', default: '1d', type: 'string' },
        ],
        defaultPath: 'http://localhost:8000/api/v1/market/history/AAPL?period=1y&interval=1d',
      },
    ],
  },
  {
    category: 'AI Predictions',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/predictions/{symbol}',
        summary: 'Multi-Step Neural Price Forecasts',
        desc: 'Deep learning inference (LSTM, GRU, Transformer, Stacking Ensemble) with 95% confidence intervals and walk-forward backtest metrics.',
        auth: false,
        params: [
          { name: 'symbol', default: 'AAPL', type: 'string' },
          { name: 'horizon', default: '7', type: 'number' },
          { name: 'model', default: 'ensemble', type: 'string' },
        ],
        defaultPath: 'http://localhost:8000/api/v1/predictions/AAPL?horizon=7&model=ensemble',
      },
    ],
  },
  {
    category: 'Quantitative Risk',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/risk/{symbol}',
        summary: 'Single-Asset Quantitative Risk Profile',
        desc: 'Value at Risk (Parametric, Historical, Monte Carlo at 95% & 99%), Conditional VaR (Expected Shortfall), Maximum Drawdown, Sharpe and Sortino ratios.',
        auth: false,
        params: [{ name: 'symbol', default: 'AAPL', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/risk/AAPL',
      },
      {
        method: 'GET',
        path: '/api/v1/risk/portfolio/{id}',
        summary: 'Multi-Asset Portfolio Covariance Risk',
        desc: 'Computes asset covariance matrix, portfolio beta, and aggregate VaR.',
        auth: false,
        params: [{ name: 'id', default: 'default-demo-portfolio', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/risk/portfolio/default-demo-portfolio',
      },
    ],
  },
  {
    category: 'Portfolio Management',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/portfolio/{id}',
        summary: 'Fetch Portfolio Valuation & Positions',
        desc: 'Returns cash balance, total mark-to-market value, unrealized P&L, and asset weights.',
        auth: false,
        params: [{ name: 'id', default: 'default-demo-portfolio', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/portfolio/default-demo-portfolio',
      },
      {
        method: 'POST',
        path: '/api/v1/portfolio/{id}/positions',
        summary: 'Execute Buy / Add Position',
        desc: 'Adds or increases an equity position with cost-basis recalculation.',
        auth: false,
        params: [
          { name: 'id', default: 'default-demo-portfolio', type: 'string' },
          { name: 'symbol', default: 'NVDA', type: 'string' },
          { name: 'quantity', default: '15', type: 'number' },
          { name: 'price', default: '138.50', type: 'number' },
        ],
        defaultPath: 'http://localhost:8000/api/v1/portfolio/default-demo-portfolio/positions',
      },
      {
        method: 'DELETE',
        path: '/api/v1/portfolio/{id}/positions/{symbol}',
        summary: 'Sell / Liquidate Position',
        desc: 'Decreases or fully closes an active security position.',
        auth: false,
        params: [
          { name: 'id', default: 'default-demo-portfolio', type: 'string' },
          { name: 'symbol', default: 'NVDA', type: 'string' },
        ],
        defaultPath: 'http://localhost:8000/api/v1/portfolio/default-demo-portfolio/positions/NVDA',
      },
    ],
  },
  {
    category: 'Watchlist',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/watchlist',
        summary: 'Retrieve User Watchlist',
        desc: 'Returns tracked securities with previous close and current quotes.',
        auth: false,
        params: [],
        defaultPath: 'http://localhost:8000/api/v1/watchlist',
      },
      {
        method: 'POST',
        path: '/api/v1/watchlist',
        summary: 'Add Security to Watchlist',
        desc: 'Subscribes ticker for live monitoring.',
        auth: false,
        params: [{ name: 'symbol', default: 'MSFT', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/watchlist',
      },
    ],
  },
  {
    category: 'Market Sentiment',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/sentiment/{symbol}',
        summary: 'Financial NLP Sentiment Analysis',
        desc: 'Processes news stream via NLTK VADER lexicon, returns polarity breakdown and articles.',
        auth: false,
        params: [{ name: 'symbol', default: 'AAPL', type: 'string' }],
        defaultPath: 'http://localhost:8000/api/v1/sentiment/AAPL',
      },
    ],
  },
];

export const SwaggerDocsPage = () => {
  const { isBackendOnline, token } = useTerminal();
  const getBackendUrl = () => {
    const envUrl = (import.meta.env.VITE_API_URL || '').trim();
    if (envUrl) {
      return envUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    }
    return 'http://localhost:8000';
  };
  const origin = getBackendUrl();
  const apiBaseUrl = `${origin}/api/v1`;

  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'embed' | 'schema'
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0].endpoints[0]);
  const [paramValues, setParamValues] = useState({});
  const [executing, setExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [responseBody, setResponseBody] = useState(null);
  const [responseLatency, setResponseLatency] = useState(null);
  const [copied, setCopied] = useState(false);

  // Initialize parameters when endpoint changes
  useEffect(() => {
    const initial = {};
    (selectedEndpoint.params || []).forEach((p) => {
      initial[p.name] = p.default;
    });
    setParamValues(initial);
    setResponseStatus(null);
    setResponseBody(null);
  }, [selectedEndpoint]);

  const handleExecuteRequest = async () => {
    setExecuting(true);
    setResponseStatus(null);
    setResponseBody(null);

    const start = performance.now();
    try {
      let url = origin + selectedEndpoint.path;

      // Replace path params
      Object.keys(paramValues).forEach((key) => {
        if (url.includes(`{${key}}`)) {
          url = url.replace(`{${key}}`, encodeURIComponent(paramValues[key]));
        }
      });

      // Append query params for GET
      if (selectedEndpoint.method === 'GET') {
        const queryParams = new URLSearchParams();
        Object.keys(paramValues).forEach((key) => {
          if (!selectedEndpoint.path.includes(`{${key}}`) && paramValues[key]) {
            queryParams.append(key, paramValues[key]);
          }
        });
        const qs = queryParams.toString();
        if (qs) url += `?${qs}`;
      }

      const headers = { Accept: 'application/json' };
      if (token && selectedEndpoint.auth) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let fetchOpts = { method: selectedEndpoint.method, headers };

      if (selectedEndpoint.method === 'POST') {
        headers['Content-Type'] = 'application/json';
        const bodyObj = {};
        Object.keys(paramValues).forEach((key) => {
          if (!selectedEndpoint.path.includes(`{${key}}`)) {
            bodyObj[key] = paramValues[key];
          }
        });
        fetchOpts.body = JSON.stringify(bodyObj);
      }

      const res = await fetch(url, fetchOpts);
      const end = performance.now();
      setResponseLatency(Math.round(end - start));
      setResponseStatus(res.status);

      const hdrs = {};
      res.headers.forEach((val, key) => {
        hdrs[key] = val;
      });
      setResponseHeaders(hdrs);

      const data = await res.json().catch(() => ({ message: 'Non-JSON response received' }));
      setResponseBody(data);
    } catch (err) {
      const end = performance.now();
      setResponseLatency(Math.round(end - start));
      setResponseStatus('503 Network Error');
      setResponseBody({
        error: 'ConnectionRefused',
        message: err.message || `FastAPI service unavailable on ${origin}`,
        hint: 'Ensure backend service is running or check Docker Compose logs',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyJson = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodBadgeClass = (m) => {
    switch (m) {
      case 'GET':
        return 'text-[#77C98B] bg-[#77C98B]/10 border-[#77C98B]/30';
      case 'POST':
        return 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30';
      case 'DELETE':
        return 'text-[#E47770] bg-[#E47770]/10 border-[#E47770]/30';
      default:
        return 'text-[#969B91] bg-[#969B91]/10 border-[#969B91]/30';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full font-mono">
      {/* 1. Header & Live OpenAPI Gateway Links */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              FASTAPI SWAGGER API & OPENAPI SPECIFICATION
            </span>
            <span className="term-badge-accent">OPENAPI 3.1.0</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Official Native Swagger UI at <span className="text-[#C7F36B] font-mono">{origin}/docs</span>, ReDoc, and Ready-to-Import Postman Collection.
          </p>
        </div>

        {/* External Gateway Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`${origin}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="term-btn-primary text-xs py-2 px-3.5 flex items-center gap-2 font-bold shadow-lg shadow-[#C7F36B]/20"
          >
            <span>LAUNCH NATIVE SWAGGER UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={`${origin}/api/v1/export/postman`}
            target="_blank"
            rel="noopener noreferrer"
            download="postman_collection.json"
            className="term-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <span>POSTMAN COLLECTION</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={`${origin}/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="term-btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 border border-[#343B33]"
          >
            <span>REDOC</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={`${origin}/openapi.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="term-btn-ghost text-xs py-2 px-3 flex items-center gap-1 border border-[#343B33]"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SCHEMA (JSON)</span>
          </a>
        </div>
      </div>

      {/* 3-Step End-to-End Workflow Guide */}
      <div className="term-panel p-4 bg-[#141814] border border-[#343B33]">
        <div className="text-xs font-heading font-bold text-[#C7F36B] uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>End-to-End Testing Workflow: Swagger → Postman → Web Application</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#101310] border border-[#242B24] space-y-1">
            <div className="font-bold text-[#E9E8DF] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Native Swagger UI</span>
            </div>
            <p className="text-[11px] text-[#969B91]">
              Open <a href={`${origin}/docs`} target="_blank" rel="noreferrer" className="text-[#C7F36B] underline font-mono">/docs</a>. Click <strong>Authorize</strong> (top-right). Use Username: <code className="text-[#C7F36B]">demotrader</code>, Password: <code className="text-[#C7F36B]">demopass</code>. Test any of the 9 modules directly with live executions.
            </p>
          </div>
          <div className="p-3 bg-[#101310] border border-[#242B24] space-y-1">
            <div className="font-bold text-[#E9E8DF] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#77C98B]/20 text-[#77C98B] text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Postman Collection</span>
            </div>
            <p className="text-[11px] text-[#969B91]">
              Import <code className="text-[#77C98B]">postman_collection.json</code> into Postman. Run <strong>Authentication → Login</strong>. The test script automatically saves the token to <code className="text-[#77C98B]">{`{{token}}`}</code> for all requests.
            </p>
          </div>
          <div className="p-3 bg-[#101310] border border-[#242B24] space-y-1">
            <div className="font-bold text-[#E9E8DF] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#7C9BF3]/20 text-[#7C9BF3] text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Web Application</span>
            </div>
            <p className="text-[11px] text-[#969B91]">
              Log in to the web app (<a href="/auth" className="text-[#7C9BF3] underline font-mono">/auth</a>) with the exact same credentials (<code className="text-[#7C9BF3]">demotrader</code> / <code className="text-[#7C9BF3]">demopass</code> or any registered user). Portfolio & watchlist sync instantly.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (Interactive Console, Embedded Swagger, Schema) */}
      <div className="flex items-center gap-2 border-b border-[#343B33] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1.5 font-bold transition-colors border ${
            activeTab === 'console'
              ? 'bg-[#C7F36B] text-[#101310] border-[#C7F36B]'
              : 'bg-[#141814] text-[#969B91] border-[#343B33] hover:text-[#E9E8DF]'
          }`}
        >
          INTERACTIVE API CONSOLE
        </button>

        <button
          onClick={() => setActiveTab('embed')}
          className={`px-3 py-1.5 font-bold transition-colors border ${
            activeTab === 'embed'
              ? 'bg-[#C7F36B] text-[#101310] border-[#C7F36B]'
              : 'bg-[#141814] text-[#969B91] border-[#343B33] hover:text-[#E9E8DF]'
          }`}
        >
          EMBEDDED SWAGGER UI (/docs)
        </button>

        <div className="ml-auto flex items-center gap-2 text-[11px] text-[#969B91]">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-[#C7F36B]" />
            BASE URL: <strong className="text-[#E9E8DF]">{apiBaseUrl}</strong>
          </span>
        </div>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Endpoints Directory (5 Cols) */}
          <div className="lg:col-span-5 term-panel flex flex-col max-h-[750px]">
            <div className="term-header">
              <span>EXPLORE ROUTE CONTRACTS</span>
              <span className="text-[10px] text-[#969B91]">22 DOCUMENTED OPERATIONS</span>
            </div>

            <div className="p-3 overflow-y-auto space-y-4 divide-y divide-[#202720]">
              {API_ENDPOINTS.map((cat) => (
                <div key={cat.category} className="pt-3 first:pt-0">
                  <div className="text-[10px] font-heading font-bold text-[#C7F36B] uppercase tracking-wider mb-2">
                    {cat.category}
                  </div>
                  <div className="space-y-1">
                    {cat.endpoints.map((ep) => {
                      const isSelected =
                        selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                      return (
                        <div
                          key={`${ep.method}-${ep.path}`}
                          onClick={() => setSelectedEndpoint(ep)}
                          className={`p-2 cursor-pointer transition-colors border ${
                            isSelected
                              ? 'bg-[#202720] border-[#C7F36B]'
                              : 'bg-[#141814] border-[#242B24] hover:border-[#343B33]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 font-bold border ${getMethodBadgeClass(
                                  ep.method
                                )}`}
                              >
                                {ep.method}
                              </span>
                              <span className="text-xs text-[#E9E8DF] font-bold truncate">
                                {ep.path}
                              </span>
                            </div>
                            {ep.auth && (
                              <Lock className="w-3 h-3 text-[#C7F36B] shrink-0" title="JWT Protected" />
                            )}
                          </div>
                          <div className="text-[10px] text-[#969B91] truncate mt-1">
                            {ep.summary}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Test Ticket & Response Console (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Request Configuration Card */}
            <div className="term-panel p-4">
              <div className="flex items-center justify-between border-b border-[#242B24] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 font-bold border ${getMethodBadgeClass(
                      selectedEndpoint.method
                    )}`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-heading font-black text-sm text-[#E9E8DF]">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <button
                  onClick={handleExecuteRequest}
                  disabled={executing}
                  className="term-btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
                  <span>{executing ? 'SENDING...' : 'SEND REQUEST'}</span>
                </button>
              </div>

              <p className="text-xs text-[#969B91] mb-3">{selectedEndpoint.desc}</p>

              {/* Parameter Inputs */}
              {(selectedEndpoint.params || []).length > 0 ? (
                <div className="space-y-2 border-t border-[#242B24] pt-3">
                  <div className="text-[10px] font-bold text-[#969B91] uppercase">Parameters</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEndpoint.params.map((p) => (
                      <div key={p.name}>
                        <label className="text-[10px] text-[#969B91] block mb-0.5">
                          {p.name.toUpperCase()} ({p.type})
                        </label>
                        <input
                          type={p.type === 'password' ? 'password' : 'text'}
                          value={paramValues[p.name] ?? ''}
                          onChange={(e) =>
                            setParamValues({ ...paramValues, [p.name]: e.target.value })
                          }
                          className="term-input text-xs py-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[#969B91] border-t border-[#242B24] pt-2">
                  No parameters required for this endpoint.
                </div>
              )}
            </div>

            {/* Response Console */}
            <div className="term-panel flex flex-col">
              <div className="term-header">
                <div className="flex items-center gap-3">
                  <span>LIVE HTTP RESPONSE</span>
                  {responseStatus && (
                    <span
                      className={`text-[10px] px-2 py-0.5 font-bold border ${
                        String(responseStatus).startsWith('2')
                          ? 'border-[#77C98B] text-[#77C98B] bg-[#77C98B]/10'
                          : 'border-[#E47770] text-[#E47770] bg-[#E47770]/10'
                      }`}
                    >
                      STATUS: {responseStatus}
                    </span>
                  )}
                  {responseLatency && (
                    <span className="text-[10px] text-[#969B91]">
                      TIME: <strong className="text-[#C7F36B]">{responseLatency}ms</strong>
                    </span>
                  )}
                </div>

                {responseBody && (
                  <button
                    onClick={handleCopyJson}
                    className="term-btn-ghost text-[10px] py-0.5 px-2 flex items-center gap-1 border border-[#343B33]"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#77C98B]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
                  </button>
                )}
              </div>

              <div className="p-3 bg-[#101310] max-h-96 overflow-y-auto">
                {executing ? (
                  <div className="py-12 text-center text-xs text-[#969B91] flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C7F36B]" />
                    <span>Executing request against FastAPI runtime gateway...</span>
                  </div>
                ) : responseBody ? (
                  <pre className="text-xs font-mono text-[#E9E8DF] leading-relaxed whitespace-pre-wrap break-all">
                    {JSON.stringify(responseBody, null, 2)}
                  </pre>
                ) : (
                  <div className="py-12 text-center text-xs text-[#969B91]">
                    Click "Send Request" above to dispatch a live HTTP transaction.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Swagger UI */}
      {activeTab === 'embed' && (
        <div className="term-panel flex flex-col h-[750px] overflow-hidden">
          <div className="term-header">
            <span>FASTAPI NATIVE SWAGGER UI (/docs)</span>
            <a
              href={`${origin}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#C7F36B] hover:underline flex items-center gap-1"
            >
              <span>Pop Out In New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              src={`${origin}/docs`}
              title="Swagger UI"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
