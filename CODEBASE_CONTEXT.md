# Codebase Context & Architectural Relationship Graph

This document serves as the single source of truth for AI agents and developers to understand the architecture, data flow, component dependencies, and file relationships of the **Stock Market AI Trend Prediction & Risk Analysis Platform**.

---

## 1. System Overview Architecture

The application is organized into three decoupled layers:
1. **Frontend**: Vite + React 18 single-page application with high-DPI HTML5 canvas charting, glassmorphism UI, resilient mock fallbacks, and user-friendly error recovery cards.
2. **Backend**: FastAPI REST API providing authentication, data ingestion, quantitative risk calculations, portfolio management, and hybrid prediction routing.
3. **AI Engine**: PyTorch deep learning pipeline (`LSTMForecaster`, `GRUForecaster`, `TimeSeriesTransformer`, `StackingEnsemble`) with walk-forward validation and conformal confidence interval calibration, executable either as a standalone microservice or directly in-process.

```mermaid
graph TD
    subgraph Frontend ["Frontend (Vite + React 18)"]
        UI_App["App.jsx (State Coordinator & Auth Gate)"]
        UI_API["services/api.js (API Client & Mock Fallbacks)"]
        UI_Dash["StockDashboard.jsx (Technicals & Retry UI)"]
        UI_Charts["CandlestickChart.jsx (High-DPI Canvas)"]
        UI_Pred["PredictionPanel.jsx (Forecast & 95% CI)"]
        UI_Risk["RiskDashboard.jsx"]
        UI_Port["PortfolioManager.jsx"]
        UI_Sent["SentimentViewer.jsx"]
        UI_Auth["AuthModal.jsx / AuthPage.jsx"]
        UI_Watch["WatchlistModal.jsx"]
        UI_Nav["Navbar.jsx"]
    end

    subgraph Backend ["Backend (FastAPI)"]
        Main["main.py (App Entry, Middleware, Lifespan)"]
        Config["core/config.py (Settings & CORS)"]
        DB["core/database.py (Motor MongoDB Client)"]
        Sec["core/security.py (JWT & Passlib Bcrypt)"]
        Deps["api/deps.py (Singletons & Auth Injector)"]
        Router["api/v1/router.py (Router Aggregator)"]

        subgraph Endpoints ["API Routers (api/v1/)"]
            R_Auth["auth.py (/auth)"]
            R_Stocks["stocks.py (/stocks)"]
            R_Market["market.py (/market)"]
            R_Pred["predictions.py (/predictions)"]
            R_Risk["risk.py (/risk)"]
            R_Port["portfolio.py (/portfolio)"]
            R_Watch["watchlist.py (/watchlist)"]
            R_Sent["sentiment.py (/sentiment)"]
        end

        subgraph Schemas ["Pydantic V2 Schemas (schemas/)"]
            S_User["user.py"]
            S_Stock["stock.py"]
            S_Pred["prediction.py"]
            S_Risk["risk.py"]
            S_Port["portfolio.py"]
            S_Sent["sentiment.py"]
        end

        subgraph Services ["Backend Services (services/)"]
            Serv_Pred["prediction_service.py (PredictionService)"]
            Serv_Market["market_data.py (MarketDataService - TTL Cache & Retries)"]
            Serv_Email["email_service.py (EmailOTPService - Auto-Purge)"]
            Serv_Risk["risk_service.py (RiskAnalysisService)"]
            Serv_Port["portfolio_service.py (PortfolioService)"]
            Serv_Sent["sentiment_service.py (SentimentAnalysisService)"]
        end
    end

    subgraph AIEngine ["AI Deep Learning Engine (ai_engine/)"]
        Remote_API["api.py (FastAPI Microservice on Port 8001)"]
        Pred_Engine["inference/predictor.py (StockPredictorEngine)"]
        Pipe["preprocessing/pipeline.py (FeatureScaler & Windows)"]
        TI["features/technical_indicators.py (SMA, RSI, MACD, etc.)"]
        Ensemble["models/ensemble.py (StackingEnsemble - Inverse-MSE)"]
        M_LSTM["models/lstm_model.py (LSTMForecaster)"]
        M_GRU["models/gru_model.py (GRUForecaster)"]
        M_Trans["models/transformer_model.py (TimeSeriesTransformer)"]
        Trainer["training/trainer.py (ModelTrainer)"]
        Saved["saved_models/ (*.pt PyTorch Checkpoints)"]
    end

    %% External Data & Stores
    YF[("Yahoo Finance API (yfinance)")]
    Mongo[("MongoDB Database")]

    %% Frontend to Backend
    UI_App --> UI_API
    UI_App --> UI_Dash & UI_Pred & UI_Risk & UI_Port & UI_Sent & UI_Auth & UI_Watch & UI_Nav
    UI_Dash --> UI_Charts
    UI_API -->|HTTP REST + Bearer JWT| Main

    %% Backend Routing
    Main --> Router
    Router --> R_Auth & R_Stocks & R_Market & R_Pred & R_Risk & R_Port & R_Watch & R_Sent

    %% Endpoint to Schemas
    R_Auth --> S_User
    R_Stocks --> S_Stock
    R_Market --> S_Stock
    R_Pred --> S_Pred
    R_Risk --> S_Risk
    R_Port --> S_Port
    R_Watch --> S_Stock & S_Port
    R_Sent --> S_Sent
    S_Port -.-> S_Risk

    %% Endpoint to Dependencies & Services
    R_Auth --> Sec & DB & Serv_Email
    R_Stocks --> Deps
    R_Market --> Deps
    R_Pred --> Deps
    R_Risk --> Deps
    R_Port --> Deps
    R_Watch --> Deps
    R_Sent --> Deps

    Deps --> Serv_Market & Serv_Risk & Serv_Sent & Serv_Port & Serv_Pred
    Serv_Port --> Serv_Market & Serv_Risk

    %% Prediction Service Hybrid Routing
    Serv_Pred -->|AI_ENGINE_URL set (HTTP)| Remote_API
    Serv_Pred -->|AI_ENGINE_URL unset or unavailable| Pred_Engine
    Remote_API --> Pred_Engine

    %% Services to External / AI Engine
    Serv_Market --> YF
    Serv_Market --> TI
    Serv_Sent --> YF
    DB --> Mongo

    %% Inference Engine Relationships
    Pred_Engine --> Pipe & TI & Ensemble & Trainer
    Pred_Engine --> M_LSTM & M_GRU & M_Trans
    Trainer --> Saved
```

---

## 2. Directory Structure & Key Responsibilities

```text
Capstone-II/
├── Jenkinsfile                  # CI/CD pipeline automation (build, test, deploy)
├── postman_collection.json      # Complete Postman v2.1.0 collection with auto token capture
├── postman_environment.json     # Postman local development environment variables
├── ai_engine/                   # PyTorch AI Prediction & Feature Engineering
│   ├── api.py                   # FastAPI microservice entry point (Port 8001)
│   ├── features/
│   │   └── technical_indicators.py  # SMA, EMA, MACD, RSI, Bollinger Bands, ATR
│   ├── inference/
│   │   └── predictor.py         # StockPredictorEngine: coordinates forecasting & walk-forward backtesting
│   ├── models/
│   │   ├── ensemble.py          # StackingEnsemble with inverse-MSE dynamic weighting & confidence bounds
│   │   ├── gru_model.py         # 2-layer GRU with 2D/3D tensor shape adaptability & float32 casting
│   │   ├── lstm_model.py        # 2-layer LSTM with 2D/3D tensor shape adaptability & float32 casting
│   │   └── transformer_model.py # TimeSeriesTransformer with multi-head attention & float32 casting
│   ├── preprocessing/
│   │   └── pipeline.py          # MinMaxScaler normalization & contiguous sliding window generator
│   ├── saved_models/            # Pre-trained PyTorch checkpoints (AAPL, NVDA, TSLA, TEST_SHORT)
│   └── training/
│       └── trainer.py           # Early stopping, MSE training loop, safe checkpoint restoration
│
├── backend/                     # FastAPI Backend Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py          # Dependency injector (Service singletons, get_current_user)
│   │   │   └── v1/
│   │   │       ├── auth.py      # /auth: register, login (form/json), /me, OTP recovery, OAuth
│   │   │       ├── market.py    # /market: historical OHLCV & technical indicators
│   │   │       ├── portfolio.py # /portfolio: CRUD positions, valuation, asset allocation
│   │   │       ├── predictions.py # /predictions: multi-model forecasting endpoint & discovery
│   │   │       ├── risk.py      # /risk: single stock & multi-asset portfolio risk & overview
│   │   │       ├── router.py    # Aggregator combining all sub-routers
│   │   │       ├── sentiment.py # /sentiment: NLP news scoring & sentiment index
│   │   │       ├── stocks.py    # /stocks: universe listing & ticker metadata
│   │   │       └── watchlist.py # /watchlist: user watchlist CRUD
│   │   ├── core/
│   │   │   ├── config.py        # Settings, CORS origins parser, JWT & Mongo configs
│   │   │   ├── database.py      # Async Motor MongoDB connection manager & indexer
│   │   │   └── security.py      # Bcrypt hashing & PyJWT encode/decode
│   │   ├── schemas/             # Pydantic V2 Request/Response validation models
│   │   │   ├── portfolio.py     # PositionEnriched, PortfolioResponse, PortfolioCreate
│   │   │   ├── prediction.py    # ForecastPoint, PredictionResponse, ModelEvaluationMetrics
│   │   │   ├── risk.py          # StockRiskResponse, PortfolioRiskResponse, VaRDetail
│   │   │   ├── sentiment.py     # SentimentResponse, NewsArticle, SentimentBreakdown
│   │   │   ├── stock.py         # StockBase, StockInfo, OHLCVRecord, HistoricalDataResponse
│   │   │   └── user.py          # UserCreate, UserLogin, UserOut, TokenResponse
│   │   ├── services/
│   │   │   ├── email_service.py # EmailOTPService: 6-digit OTPs with automatic expired entry purge
│   │   │   ├── market_data.py   # MarketDataService: yfinance fetching, 60s TTL cache, exponential backoff
│   │   │   ├── portfolio_service.py # Portfolio state, position cost basis, P&L
│   │   │   ├── prediction_service.py # PredictionService: AI_ENGINE_URL HTTP microservice + in-process fallback
│   │   │   ├── risk_service.py  # Monte Carlo VaR (10k walks), CVaR, Sharpe, MDD
│   │   │   └── sentiment_service.py # NLTK VADER augmented with financial lexicon
│   │   └── main.py              # FastAPI app factory, custom OpenAPI, OAuth2/Bearer auth, Postman export
│   ├── tests/                   # Pytest test suite (comprehensive regression coverage)
│   │   ├── conftest.py          # TestClient fixture, test user auth header fixture
│   │   ├── test_ai_engine_verification.py # PyTorch models, ensemble, and predictor tests
│   │   ├── test_auth.py         # User registration, JWT login, OTP reset, OAuth
│   │   ├── test_market_data.py  # Stock listings, metadata, historical OHLCV
│   │   ├── test_portfolio.py    # Portfolio creation, position add/delete, watchlist
│   │   ├── test_predictions.py  # Technical indicator calculation, AI endpoint
│   │   ├── test_risk.py         # Stock risk metrics, multi-asset portfolio covariance
│   │   └── test_sentiment.py    # News sentiment analyzer & endpoint
│   └── requirements.txt         # Backend dependencies
│
└── frontend/                    # Vite + React 18 Frontend Application
    ├── src/
    │   ├── components/
    │   │   ├── AuthModal.jsx        # Login/Register modal dialogue
    │   │   ├── AuthPage.jsx         # Dedicated full-page authentication landing
    │   │   ├── CandlestickChart.jsx # Interactive Canvas OHLCV chart with High-DPI scaling
    │   │   ├── MarketTickerBar.jsx  # Scrolling top ticker tape
    │   │   ├── Navbar.jsx           # Top navigation, status indicator, active tab switch, quick logout
    │   │   ├── PortfolioManager.jsx # Portfolio metrics, position table, allocation pie
    │   │   ├── PredictionPanel.jsx  # AI forecast horizon chart, 95% CI cone, model metrics, Retry UI
    │   │   ├── RiskDashboard.jsx    # Risk dial, 4 core ratios, VaR/CVaR tables
    │   │   ├── SentimentViewer.jsx  # Sentiment index gauge, breakdown, news feed
    │   │   ├── StockDashboard.jsx   # Stock dashboard view with error handling & retry UI
    │   │   └── WatchlistModal.jsx   # Watchlist management modal
    │   ├── pages/
    │   │   ├── AuthPage.jsx         # Dedicated full-page authentication landing
    │   │   ├── ModelPerformancePage.jsx # Walk-forward validation & error metric tables
    │   │   ├── OverviewPage.jsx     # Master trading terminal dashboard view
    │   │   ├── PortfolioPage.jsx    # Virtual portfolio & position management
    │   │   ├── PredictionsPage.jsx  # AI forecast horizon exploration
    │   │   ├── RiskAnalyticsPage.jsx # Tail risk, VaR & Monte Carlo analysis
    │   │   ├── SentimentPage.jsx    # Real-time financial news NLP sentiment
    │   │   ├── SettingsPage.jsx     # Terminal configuration & direct Swagger launch
    │   │   ├── StockExplorerPage.jsx # Monitored equity universe table
    │   │   ├── SwaggerDocsPage.jsx  # Interactive API console, ReDoc & Postman center
    │   │   └── WatchlistPage.jsx    # Persistent stock tracking list
    │   ├── services/
    │   │   └── api.js               # Central API client with automatic mock fallbacks
    │   ├── App.jsx                  # Main coordinator managing tabs, auth gate, and logout
    │   ├── index.css                # Tailwind CSS 4 directives and glassmorphism styling
    │   └── index.jsx                # React DOM render entry
    ├── package.json
    └── vite.config.js
```

---

## 3. Data Flow & Inter-Component Relationships

### A. Market Data & Candlestick Flow
1. **Frontend**: [`StockDashboard.jsx`](frontend/src/components/StockDashboard.jsx) or [`CandlestickChart.jsx`](frontend/src/components/CandlestickChart.jsx) calls `apiClient.getMarketHistory(symbol, period, interval)`.
2. **Backend**: Dispatches to [`market.py`](backend/app/api/v1/market.py) `GET /api/v1/market/history/{symbol}`.
3. **Resilient Service**: [`MarketDataService.get_historical_records`](backend/app/services/market_data.py):
   - Checks the in-memory TTL cache (60 seconds) by symbol and period to prevent duplicate upstream calls.
   - If not cached, executes `fetch_historical_ohlcv` with **exponential backoff retry** (up to 3 attempts) to protect against Yahoo Finance 429 rate limiting.
   - Falls back gracefully to deterministic Geometric Brownian Motion synthetic data if Yahoo Finance is completely unavailable.
4. **Indicators**: Invokes `compute_technical_indicators(df)` in [`technical_indicators.py`](ai_engine/features/technical_indicators.py) to calculate SMA-20/50, EMA-12/26, MACD, MACD Signal, RSI-14, and Bollinger Bands.
5. **Database**: Upserts latest 30 candle points into MongoDB collection `historical_prices` (if connected).
6. **Response & High-DPI Rendering**: Validated against [`HistoricalDataResponse`](backend/app/schemas/stock.py). Rendered crisply using `window.devicePixelRatio` canvas scaling and dynamic `ResizeObserver` container recalculation.

### B. AI Trend Prediction Flow
1. **Frontend**: [`PredictionPanel.jsx`](frontend/src/components/PredictionPanel.jsx) calls `apiClient.getPredictions(symbol, horizon, model)`.
2. **Backend**: Handled by [`predictions.py`](backend/app/api/v1/predictions.py).
3. **Hybrid Routing via `PredictionService`**:
   - [`PredictionService`](backend/app/services/prediction_service.py) inspects the `AI_ENGINE_URL` environment variable.
   - If configured, sends an HTTP request to the external FastAPI microservice (`ai_engine/api.py`).
   - If unconfigured or the remote service is unreachable, falls back seamlessly to the direct in-process [`StockPredictorEngine`](ai_engine/inference/predictor.py).
4. **Deep Learning Inference**:
   - Calculates 18-feature technical indicators over historical prices.
   - Feeds data into PyTorch models ([`LSTMForecaster`](ai_engine/models/lstm_model.py), [`GRUForecaster`](ai_engine/models/gru_model.py), [`TimeSeriesTransformer`](ai_engine/models/transformer_model.py)), which adaptively accept both 2D and 3D tensor inputs and cast safely to `float32`.
   - Restores pre-trained weights from `saved_models/` checkpoints.
   - Executes [`StackingEnsemble`](ai_engine/models/ensemble.py) using dynamic out-of-sample inverse-MSE weighting, residual quantile confidence intervals (`lower_bound` / `upper_bound`), and non-negative price floor calibration.
   - Computes backtest evaluation metrics (MAE, RMSE, MAPE, Directional Accuracy %).
5. **Classification**: Labels trend as **Bullish** (>1% expected return), **Bearish** (<-1% expected drop), or **Sideways**.
6. **Response & Error Handling**: Validated against [`PredictionResponse`](backend/app/schemas/prediction.py). If an error occurs, an error card with a **"Retry Prediction"** button is rendered instead of an infinite spinner.

### C. Financial Risk Modeling Flow
1. **Single Stock Risk**:
   - [`RiskDashboard.jsx`](frontend/src/components/RiskDashboard.jsx) requests [`risk.py`](backend/app/api/v1/risk.py) `GET /api/v1/risk/{symbol}`.
   - [`RiskAnalysisService`](backend/app/services/risk_service.py) computes 252-day continuous log return volatility $\sigma$.
   - Executes **10,000-path Monte Carlo Geometric Brownian Motion (GBM)** simulations.
   - Calculates **Parametric, Historical, and Monte Carlo Value at Risk (VaR)** at 95% and 99% confidence levels.
   - Computes **Conditional Value at Risk (CVaR / Expected Shortfall)**.
   - Evaluates peak-to-trough **Maximum Drawdown (MDD)**, **Sharpe Ratio** (4.0% risk-free rate), and **Sortino Ratio** (downside deviation).
   - Classifies asset into *Low Risk*, *Medium Risk*, or *High Risk*.
2. **Multi-Asset Portfolio Risk**:
   - [`portfolio.py`](backend/app/api/v1/portfolio.py) invokes `calculate_portfolio_risk(holdings_weights, price_matrix)`.
   - Computes the empirical asset covariance matrix $\Sigma$ and asset correlation matrix.
   - Computes total portfolio volatility $\sigma_p = \sqrt{w^T \Sigma w}$ and diversification benefit ratio.

### D. Authentication, Password Reset & Session Management Flow
1. **Registration & Login**: Handled by [`auth.py`](backend/app/api/v1/auth.py). Issues secure HS256 JWT tokens.
2. **Two-Step Email OTP**:
   - Step 1: `POST /api/v1/auth/forgot-password` generates a 6-digit OTP via [`EmailOTPService`](backend/app/services/email_service.py).
   - Automatic Purge: Expired OTP entries are automatically removed from memory during every generation and verification request (`_purge_expired_otps`).
   - Step 2: `POST /api/v1/auth/reset-password` validates the OTP, enforces matching passwords, updates the database, and invalidates the code.
3. **Session Invalidation & Smooth Logout**:
   - In [`App.jsx`](frontend/src/App.jsx) and [`Navbar.jsx`](frontend/src/components/Navbar.jsx), `handleLogout` removes all tokens (`alpha_jwt_token`, `token`, `user`, etc.) from `localStorage`, clears `apiClient.token`, resets user/portfolio/watchlist state, and immediately renders `<AuthPage />` without requiring a browser refresh.

### E. Virtual Portfolio & Watchlist Flow
1. **Creation & Management**: Handled by [`portfolio_service.py`](backend/app/services/portfolio_service.py).
2. **Position Accounting**:
   - `add_position`: Deducts cash, calculates weighted average purchase price.
   - `remove_position`: Decreases quantity or liquidates, credits cash proceeds at market price.
   - `get_portfolio_summary`: Calculates real-time valuation, unrealized P&L ($ and %), and asset allocation percentages.
3. **Watchlist**: Users add/remove tickers in [`watchlist.py`](backend/app/api/v1/watchlist.py); returns enriched [`StockInfo`](backend/app/schemas/stock.py) records.

### F. Market Sentiment Analysis Flow
1. **News Acquisition**: [`SentimentAnalysisService`](backend/app/services/sentiment_service.py) fetches recent news via `yfinance.Ticker.news` with financial template fallbacks.
2. **NLP Scoring**: Uses NLTK's `SentimentIntensityAnalyzer` (VADER) augmented with 19 financial domain-specific polarity overrides.
3. **Aggregation**: Calculates composite compound score (-1.0 to +1.0), positive/neutral/negative percentage breakdown, and maps compound score into a `0-100` **Sentiment Index**.

### G. Native Swagger UI, OpenAPI & Postman Architecture
1. **Native Swagger (`/docs`) & ReDoc (`/redoc`)**:
   - Hosted natively by FastAPI at `http://localhost:8000/docs`.
   - Custom OpenAPI configuration injects both `OAuth2PasswordBearer` (tokenUrl `/api/v1/auth/login`) and direct `BearerAuth`.
   - Authorize modal accepts `username: demotrader` and `password: demopass` to unlock all protected endpoints.
   - Route deduplication: Primary router mounted at `/api/v1`; aliases (`/api`, `/`) use `include_in_schema=False` to prevent duplicate OpenAPI clutter.
   - Pre-populated login schema: `POST /api/v1/auth/login` uses `LOGIN_OPENAPI_EXTRA` with JSON and form examples prefilled with `demotrader` / `demopass`.
2. **Postman Collection & Environment Export**:
   - `postman_collection.json` (v2.1.0) and `postman_environment.json` in the root workspace cover all 9 modules.
   - Automated token capture: `Authentication -> Login` test script automatically stores `access_token` in `{{token}}`.
   - Export endpoints: `GET /api/v1/export/postman` and `GET /api/v1/export/postman-environment` allow direct download via browser or API.
3. **Synchronized Credential Store**:
   - Single source of truth across Swagger, Postman, and the React Web Application (`/auth`).
   - Default user `demotrader` / `demopass` or any user registered via `POST /api/v1/auth/register` works seamlessly across all 3 interfaces.

---

## 4. Key Cross-Cutting Conventions

1. **Date/Time Handling**:
   - All server timestamps use timezone-aware UTC: `datetime.now(timezone.utc).isoformat()`.
   - Deprecated Python functions (`utcnow()`, `utcfromtimestamp()`) are strictly avoided.
2. **CORS & Frontend Ports**:
   - [`config.py`](backend/app/core/config.py) provides origins for React (`3000`), Vite (`5173`), and backend documentation (`8000`).
   - Uses `allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$"` so arbitrary local dev ports work with `allow_credentials=True`.
3. **Resilience & Fallbacks**:
   - Backend services run in hybrid mode: full persistence in MongoDB if connected, graceful automatic fallback to in-memory dictionary stores if MongoDB is offline.
   - Frontend [`api.js`](frontend/src/services/api.js) automatically provides mock data if the backend is booting, ensuring the UI never crashes.
4. **High-DPI Canvas & Responsive Lifecycle**:
   - **High-DPI (`window.devicePixelRatio`)**: Both [`CandlestickChart.jsx`](frontend/src/components/CandlestickChart.jsx) and [`PredictionPanel.jsx`](frontend/src/components/PredictionPanel.jsx) scale canvas dimensions by `window.devicePixelRatio` and apply `ctx.scale(dpr, dpr)` to ensure sharp graphics on high-resolution displays.
   - **`ResizeObserver` on Canvas Containers**: Container elements attach a `ResizeObserver` and a window resize event listener to automatically recalculate dimensions and redraw charts on tab switches or browser resizing without requiring a page refresh.
5. **API Error Handling & Retry Pattern**:
   - Whenever an API request errors or is rate-limited, components ([`StockDashboard.jsx`](frontend/src/components/StockDashboard.jsx), [`PredictionPanel.jsx`](frontend/src/components/PredictionPanel.jsx)) catch the exception, clear the loading indicator, and render an accessible error card with an alert icon, clear messaging, and a "Retry" button.
6. **Defensive API Data Parsing & Division-by-Zero Protection**:
   - All numeric properties formatted with `.toFixed(2)` or `.toLocaleString()` are wrapped in nullish coalescing checks `Number(val || 0)` or guarded to prevent runtime `TypeError` on pending payloads.
   - Percentage returns in ticker bars, stock strips, and crosshair overlays guard against zero denominators `(prevClose > 0 ? ... : '0.00')`.
7. **End-to-End Selenium UI Testing & Data-TestID Patterns**:
   - UI elements throughout the application (such as `search-input`, `navbar-swagger-btn`, `open-auth-btn`, `nav-tab-*`, `quick-ticker-*`) carry explicit `data-testid` attributes.
   - Headless Chrome tests can be executed reliably via Selenium WebDriver without relying on fragile CSS class name selectors.
8. **GitIgnore Multi-Tier Policy**:
   - `.gitignore` strictly protects against repository bloat and credential leaks across Python (`__pycache__`, `venv/`), Node (`node_modules/`, `dist/`), test reports (`reports/`), Selenium (`.wdm/`, driver logs), ML checkpoints, and multi-tier environment files (`.env`, `backend/.env`, `frontend/.env`).
