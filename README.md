# AI-Based Stock Market Trend Prediction & Risk Analysis

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)](https://jenkins.io)

An industry-level, production-grade artificial intelligence and quantitative financial analytics platform. It predicts future stock price trajectories, classifies directional trends, measures comprehensive tail risks (VaR/CVaR/MDD), analyzes real-time financial news sentiment, and provides interactive visualizations via a modern React financial dashboard.

---

## 🏛️ System Architecture

```text
                               ┌────────────────────────────────┐
                               │   React Frontend Dashboard     │
                               │   (Port 3000 / Vite / Nginx)   │
                               └───────────────┬────────────────┘
                                               │ REST (JWT)
                                               ▼
                               ┌────────────────────────────────┐
                               │     FastAPI Backend API        │
                               │  (Port 8000 / OpenAPI Swagger) │
                               └───────┬──────────────┬─────────┘
                                       │              │
                   ┌───────────────────┴──┐        ┌──┴───────────────────┐
                   ▼                      ▼        ▼                      ▼
        ┌───────────────────────┐  ┌─────────────┐ ┌───────────────────┐ ┌───────────────┐
        │   AI Inference Engine │  │ yfinance /  │ │ MongoDB Database  │ │ NLP Sentiment │
        │  (LSTM, GRU, Xformer, │  │ Live Market │ │ (Prices, Users,   │ │ (Domain VADER │
        │   Stacking Ensemble)  │  │ Feed Cache  │ │  Portfolios, Risk)│ │  News Scorer) │
        └───────────────────────┘  └─────────────┘ └───────────────────┘ └───────────────┘
```

---

## 🚀 Key Functional Modules

### 1. Market Data Collection & Feature Engineering
- Fetches real-time and historical OHLCV candles via `yfinance` with fallback resilience.
- Precomputes technical indicators: **SMA (20, 50, 200)**, **EMA (12, 26)**, **MACD & Signal**, **RSI (14)**, **Bollinger Bands**, **ATR (14)**, and **Historical Volatility**.
- Persists market data and asset metadata directly in **MongoDB** collections with compound indexes.

### 2. AI Time-Series Forecasting
- **PyTorch Architectures**:
  - Deep Multi-Layer **LSTM** with layer normalization.
  - Gated Recurrent Unit (**GRU**) with GELU activations.
  - **TimeSeriesTransformer** with sinusoidal positional encodings and multi-head attention.
  - **Inverse-Variance Stacking Ensemble** combining models dynamically based on validation error.
- **Leak-Free Preprocessing**: Chronological 70/15/15 train/val/test splits, sliding window generation, and isolated MinMax scaling.
- **Statistical Calibration**: Empirical residual quantile calibration for true 95% confidence intervals.
- **Backtest Metrics**: Evaluates predictions using MAE, RMSE, MAPE, and Directional Accuracy.
- **Trend Classification**: Categorizes trajectories into **Bullish**, **Bearish**, or **Sideways**.

### 3. Quantitative Financial Risk Modeling
- **Annualized Historical Volatility**: $\sigma \times \sqrt{252}$ on continuous log-returns.
- **Value at Risk (VaR)**:
  - Parametric (Variance-Covariance) VaR.
  - Historical Simulation Empirical VaR.
  - Monte Carlo Simulation using 10,000 Geometric Brownian Motion (GBM) paths.
- **Conditional Value at Risk (CVaR / Expected Shortfall)**: Sub-additive coherent tail loss measure.
- **Maximum Drawdown (MDD)**: Peak-to-trough drop with exact date indexing.
- **Sharpe & Sortino Ratios**: Risk-adjusted returns against a 4.0% annualized risk-free benchmark.
- **Risk Categorization**: Classifies securities into **Low Risk**, **Medium Risk**, or **High Risk**.

### 4. Virtual Portfolio Management
- Track virtual portfolio cash balances, asset positions, and total mark-to-market valuation.
- Calculates unrealized P&L in dollar terms and percentage returns.
- Computes portfolio-level multi-asset risk using covariance matrices and measures diversification benefits.

### 5. Financial Sentiment Analysis
- Aggregates latest financial news headlines and publisher releases.
- Applies financial NLP sentiment scoring with domain-augmented financial lexicons.
- Classifies sentiment as Positive, Negative, or Neutral, and computes a 0-100 Sentiment Index.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Backend Framework** | Python 3.11, FastAPI, Uvicorn |
| **API Documentation** | Swagger UI (`/docs`), ReDoc (`/redoc`), OpenAPI 3.1 |
| **Deep Learning & ML** | PyTorch, Scikit-learn, SciPy, NumPy, Pandas |
| **Database** | MongoDB 6.0, Motor (Async driver) |
| **Frontend UI** | React 18, Vite, Lucide Icons, Pure Canvas Renderers |
| **Market Data** | Yahoo Finance (`yfinance`) |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | Jenkinsfile (8-stage pipeline) |
| **Authentication** | JWT (JSON Web Tokens) with OAuth2 Password Bearer |

---

## 📦 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user account |
| `POST` | `/api/v1/auth/login` | Authenticate user and return JWT Bearer token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/v1/stocks` | List available tracked stocks |
| `GET` | `/api/v1/stocks/{symbol}` | Get real-time stock quote and metadata |
| `GET` | `/api/v1/market/history/{symbol}` | Historical OHLCV candles & technical indicators |
| `GET` | `/api/v1/predictions/{symbol}` | AI price trajectory forecasts, confidence bands & metrics |
| `GET` | `/api/v1/risk/{symbol}` | Quantitative stock risk assessment (VaR/CVaR/MDD) |
| `POST` | `/api/v1/risk/portfolio` | Calculate multi-asset portfolio covariance risk |
| `GET` | `/api/v1/portfolio/{id}` | Retrieve virtual portfolio valuation & allocations |
| `POST` | `/api/v1/portfolio/{id}/positions` | Add or buy a stock position |
| `DELETE` | `/api/v1/portfolio/{id}/positions/{symbol}` | Sell or remove a stock position |
| `GET` | `/api/v1/watchlist` | Get user's tracked watchlist |
| `POST` | `/api/v1/watchlist` | Add stock symbol to watchlist |
| `DELETE` | `/api/v1/watchlist/{symbol}` | Remove stock symbol from watchlist |
| `GET` | `/api/v1/sentiment/{symbol}` | Analyze real-time market news sentiment |
| `GET` | `/health` | Service health status |

Interactive Swagger documentation is available at **`http://localhost:8000/docs`**.

---

## 🏃 Quickstart: Running Locally

### Option 1: Run with Docker Compose (Recommended)

Ensure Docker and Docker Compose are installed on your machine, then run:

```bash
docker compose up --build
```

Services will start:
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI Backend & Swagger**: `http://localhost:8000/docs`
- **AI Inference Engine**: `http://localhost:8001/health`
- **MongoDB**: `localhost:27017`

### Option 2: Run Services Manually for Development

#### 1. Setup Backend & AI Engine
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r backend/requirements.txt
```

Start the FastAPI backend:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Setup Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 Testing & Quality Assurance

Run the complete Pytest suite covering authentication, risk models, AI metrics, and API endpoints:

```bash
python -m pytest backend/tests -v
```

All test suites:
- `backend/tests/test_auth.py`
- `backend/tests/test_market_data.py`
- `backend/tests/test_predictions.py`
- `backend/tests/test_risk.py`
- `backend/tests/test_portfolio.py`
- `backend/tests/test_sentiment.py`

---

## 🔄 Jenkins CI/CD Pipeline

The included `Jenkinsfile` provides an enterprise-ready 8-stage pipeline:
1. **Git Checkout**: Pulls latest commits.
2. **Dependency Installation**: Sets up Python virtual environments and npm dependencies.
3. **Code Quality Checks**: Executes Flake8 static analysis.
4. **Backend Testing**: Runs Pytest and publishes JUnit test results.
5. **Frontend Testing & Build**: Compiles React Vite distribution bundle.
6. **Docker Image Build**: Builds production container images.
7. **Docker Compose Deployment**: Performs zero-downtime containerized local deployment.
8. **Application Health Check**: Verifies HTTP status codes on `/health` and `/docs`.

---

## ⚠️ Financial Disclaimer

All stock market price forecasts, trend classifications, risk models, and sentiment scores produced by this application are experimental analytical estimates designed for research and educational demonstrations. **They do not constitute investment advice, financial planning, or guaranteed returns.**
