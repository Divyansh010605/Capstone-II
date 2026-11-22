# AI-Based Stock Market Trend Prediction & Quantitative Risk Analysis

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)](https://jenkins.io)

An institutional-grade, full-stack quantitative trading analytics and AI forecasting platform. It forecasts multi-horizon stock price trajectories, classifies directional market trends, performs comprehensive tail risk modeling (**Monte Carlo**, **VaR**, **CVaR**, **MDD**), scores real-time financial news sentiment using NLP, and provides a cyber-fintech trading terminal with complete JWT/OAuth authentication and OTP password recovery.

---

## 🏛️ System Architecture

```text
                               ┌──────────────────────────────────────────────┐
                               │       React Trading Terminal Client          │
                               │  (Port 3000 / Vite / Canvas / TailwindCSS)   │
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTP / REST (JWT Bearer)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           Nginx Reverse Proxy Gateway        │
                               │        Proxies /api/* & /health upstream     │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │             FastAPI Backend API              │
                               │         (Port 8000 / Swagger / OpenAPI)      │
                               └───────┬──────────────┬──────────────┬────────┘
                                       │              │              │
                   ┌───────────────────┴──┐           │           ┌──┴───────────────────┐
                   ▼                      ▼           ▼           ▼                      ▼
        ┌───────────────────────┐  ┌─────────────┐ ┌───────────┐ ┌───────────────────┐ ┌───────────────┐
        │   AI Inference Engine │  │ Market Data │ │ Email OTP │ │ MongoDB Database  │ │ NLP Sentiment │
        │  (LSTM, GRU, Xformer, │  │   Service   │ │  Service  │ │ (Users, Sessions, │ │ (Domain VADER │
        │   Stacking Ensemble)  │  │  (yfinance) │ │  (SMTP)   │ │  Portfolios, Risk)│ │  News Scorer) │
        └───────────────────────┘  └─────────────┘ └───────────┘ └───────────────────┘ └───────────────┘
```

---

## 🌟 Key Functional Pillars

### 1. 🤖 Deep Learning Stock Trend Prediction
* **Multi-Model Architecture**:
  * **LSTM**: Captures long-term sequential price patterns and momentum.
  * **GRU**: Accelerated gated recurrence minimizing vanishing gradient risks.
  * **Time-Series Transformer**: Multi-Head Self-Attention modeling cross-timestep correlations.
  * **Stacking Ensemble**: Ridge meta-regressor weighting base models to reduce variance and out-of-sample error.
* **Leak-Free Sequence Pipeline**: 60-day chronological sliding window with isolated MinMax scaling.
* **Feature Extraction**: Enriched with 8 quantitative indicators: SMA (20, 50, 200), EMA (12, 26), RSI-14, MACD, Bollinger Bands, ATR, Return Momentum, and Volume Oscillators.
* **Empirical Statistical Calibration**: Residual quantile modeling for authentic **95% Confidence Intervals**.
* **Trend & Evaluation Output**: Classifies trajectories into **Bullish**, **Bearish**, or **Sideways** with backtest metrics (MAE, RMSE, MAPE, Directional Accuracy).

### 2. 🛡️ Quantitative Risk Profiler
* **Monte Carlo Stochastic Simulation**: Simulates **10,000 Geometric Brownian Motion (GBM) paths** to capture probability distributions of tail risk.
* **Value at Risk (VaR)**: Parametric, Historical, and Monte Carlo VaR at 95% and 99% confidence intervals.
* **Conditional Value at Risk (CVaR / Expected Shortfall)**: Sub-additive coherent measure quantifying average losses in extreme tail crash scenarios.
* **Risk-Adjusted Performance**: Annualized Volatility ($\sigma \times \sqrt{252}$), Sharpe Ratio (4.0% risk-free rate benchmark), Sortino Ratio (downside risk), and Maximum Drawdown (MDD).
* **Multi-Asset Portfolio Covariance**: Generates full variance-covariance matrix to calculate portfolio volatility and quantify the mathematical **Diversification Benefit %**.

### 3. 🔐 Enterprise Authentication & Recovery
* **Dedicated Initial Auth Landing**: Clean, responsive greeting screen ([AuthPage.jsx](file:///F:/Capstone-II/frontend/src/components/AuthPage.jsx)) greeting unauthenticated visitors.
* **Sign In & Register**: Username/Email login, password confirmation validation, and visibility eye toggles.
* **Two-Step Email OTP Password Reset**:
  * **Step 1**: Dispatches a cryptographically secure 6-digit verification code to the registered email address.
  * **Step 2**: Validates the OTP, enforces password matching, hashes the new password with bcrypt, and invalidates used codes.
  * Supports SMTP delivery with automatic development-mode console fallback.
* **Google & GitHub OAuth**: Single-sign-on (SSO) endpoints with automatic account provisioning.
* **Guest Exploration**: One-click "Explore as Guest" option to preview live terminal features without signing up.

### 4. 💼 Virtual Portfolio & Live Watchlist
* **Mark-to-Market Valuation**: Track virtual cash, positions, cost basis, unrealized P&L ($ and %), and multi-asset allocation distributions.
* **Trade Outlay Calculator**: Live estimated purchase cost calculator when adding positions.
* **Real-Time Watchlist**: Modal with ticker search, price tracking, and instantaneous add/remove.

### 5. 📰 Financial News NLP Sentiment
* Evaluates recent market headlines using financial-domain augmented lexicon scoring (VADER NLP).
* Outputs sentiment classification (Positive / Neutral / Negative) and a 0–100 Sentiment Polarity Index.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, Python-Dotenv |
| **Deep Learning & ML** | PyTorch, Scikit-learn, SciPy, NumPy, Pandas |
| **Frontend UI** | React 18, Vite 5.4, TailwindCSS v4, Lucide Icons, HTML5 Canvas |
| **Database & ODM** | MongoDB 6.0, Motor (Async Driver), In-Memory Mock Fallback |
| **Market Data** | Yahoo Finance (`yfinance`) with offline data generation fallbacks |
| **Security & Auth** | JWT Bearer (HS256), Passlib (Bcrypt & PBKDF2), OAuth 2.0, SMTP Email OTP |
| **Containerization** | Docker, Docker Compose, Nginx Alpine |
| **CI / CD** | Jenkinsfile (Pipeline with SCM Polling every minute) |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX |

---

## 📦 REST API Endpoints

### Authentication & Password Reset
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account with confirm password validation |
| `POST` | `/api/v1/auth/login` | Authenticate via JSON or OAuth2 form and receive JWT Bearer token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile via Bearer token |
| `POST` | `/api/v1/auth/forgot-password` | Request 6-digit OTP verification code sent to email |
| `POST` | `/api/v1/auth/verify-otp` | Pre-validate the 6-digit OTP code |
| `POST` | `/api/v1/auth/reset-password` | Verify OTP and set a new password |
| `POST` | `/api/v1/auth/oauth/{provider}` | Google / GitHub OAuth authentication and auto-registration |

### Market Data & AI Predictions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/stocks` | List available tracked equities (AAPL, MSFT, NVDA, GOOGL, etc.) |
| `GET` | `/api/v1/stocks/{symbol}` | Fetch real-time equity quote, PE ratio, 52-week range, and metadata |
| `GET` | `/api/v1/market/history/{symbol}` | OHLCV history with SMA, EMA, MACD, RSI, and Bollinger Bands |
| `GET` | `/api/v1/predictions` | Information on available models and forecast horizons |
| `GET` | `/api/v1/predictions/{symbol}` | Multi-horizon forecast (1, 5, 14, 30 days) with 95% confidence bounds |

### Quantitative Risk & Portfolio
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/risk/{symbol}` | Single-asset risk profile (VaR, CVaR, MDD, Sharpe, Sortino) |
| `POST` | `/api/v1/risk/portfolio` | Multi-asset portfolio covariance risk and diversification benefit |
| `GET` | `/api/v1/portfolio` | Retrieve active virtual portfolio valuation and allocations |
| `POST` | `/api/v1/portfolio` | Initialize a new virtual portfolio |
| `POST` | `/api/v1/portfolio/{id}/positions` | Add or buy shares for a stock position |
| `DELETE` | `/api/v1/portfolio/{id}/positions/{symbol}` | Remove or liquidate an equity position |
| `GET` | `/api/v1/watchlist` | Retrieve user watchlist items |
| `POST` | `/api/v1/watchlist` | Add ticker symbol to watchlist |
| `DELETE` | `/api/v1/watchlist/{symbol}` | Remove ticker symbol from watchlist |
| `GET` | `/api/v1/sentiment/{symbol}` | NLP news sentiment score and indexed headline breakdown |
| `GET` | `/health` | Service health status and component diagnostic check |

Interactive OpenAPI documentation is live at **`http://localhost:8000/docs`**.

---

## 🏃 Quickstart: Running Locally

### Option 1: Docker Compose (Recommended)

1. Clone repository and verify environment defaults:
   ```bash
   cp .env.example .env
   ```
2. Build and launch all microservices:
   ```bash
   docker compose up --build
   ```
3. Access services:
   * **Frontend Terminal**: `http://localhost:3000`
   * **FastAPI Backend & Docs**: `http://localhost:8000/docs`
   * **AI Engine Microservice**: `http://localhost:8001/health`
   * **MongoDB**: `localhost:27017`

---

### Option 2: Local Development Setup (Without Docker)

#### 1. Backend & AI Engine
```bash
# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend React / Vite Client
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

Run the complete test suite across authentication, OTP password reset, OAuth, risk analytics, and API endpoints:

```bash
# Execute full test suite
python -m pytest backend/tests -v
```

**Verified Test Suites (45/45 Passing)**:
* `backend/tests/test_auth.py` (Registration, login, password mismatch, OTP reset, OAuth)
* `backend/tests/test_portfolio.py` (Portfolio CRUD, positions, watchlist)
* `backend/tests/test_risk.py` (GBM simulation, VaR/CVaR, Sharpe ratio)
* `backend/tests/test_all_endpoints_comprehensive.py` (End-to-end endpoint regression suite)

---

## 🔄 Jenkins CI/CD Automation

The repository includes a production-grade [Jenkinsfile](file:///F:/Capstone-II/Jenkinsfile) configured for automated continuous integration:
* **Triggering**: Configured with `pollSCM('* * * * *')` to automatically trigger builds on every new Git commit.
* **Cross-Platform Compatibility**: Automatically detects Unix vs Windows environments and sets explicit user environment paths for Python, pytest, Node.js, and Docker.
* **Pipeline Stages**:
  1. **Checkout**: Clones the latest commit from SCM.
  2. **Backend Dependencies & Test**: Executes automated pytest suite with zero warnings.
  3. **Frontend Build**: Verifies dependencies and compiles production Vite assets.
  4. **Docker Images Build**: Builds production container images for deployment.

---

## ⚠️ Financial Disclaimer

All stock market price forecasts, directional trend predictions, quantitative risk evaluations, and sentiment scores produced by this software are experimental statistical outputs intended strictly for research and educational demonstrations. **They do not constitute financial advice, investment recommendations, or guarantees of profit.**
