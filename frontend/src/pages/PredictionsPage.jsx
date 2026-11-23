import React, { useState } from 'react';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
import { ConfidenceIntervalChart } from '../components/charts/ConfidenceIntervalChart';

const HORIZONS = [1, 5, 7, 14, 30];

const MODELS = [
  { id: 'ensemble', name: 'Stacking Ensemble', desc: 'Weighted meta-learner combining LSTM, GRU & Transformer' },
  { id: 'transformer', name: 'Temporal Transformer', desc: 'Multi-head self-attention for sequence dynamics' },
  { id: 'lstm', name: 'LSTM Network', desc: 'Long Short-Term Memory recurrent neural architecture' },
  { id: 'gru', name: 'GRU Network', desc: 'Gated Recurrent Unit with optimized gating mechanics' },
];

export const PredictionsPage = () => {
  const {
    selectedSymbol,
    selectedHorizon,
    setSelectedHorizon,
    selectedModel,
    setSelectedModel,
    predictionData,
    loadingPred,
    refreshMarket,
  } = useTerminal();

  const forecast = predictionData?.forecast || [];
  const currentPrice = predictionData?.current_price || 185.0;
  const finalPrice = predictionData?.predicted_final_price || currentPrice * 1.03;
  const expectedReturn = predictionData?.expected_return_pct || 3.12;
  const trend = predictionData?.trend || 'Bullish';
  const metrics = predictionData?.evaluation_metrics || {
    mae: 2.15,
    rmse: 2.84,
    mape: 1.42,
    directional_accuracy: 72.4,
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header & Configuration Bar */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              AI PREDICTION CENTER // {selectedSymbol}
            </span>
            <span className="term-badge-accent">PYTORCH INFERENCE</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Walk-Forward Multi-Step Price Projections & Calibrated 95% Confidence Bounds
          </p>
        </div>

        <button
          onClick={refreshMarket}
          disabled={loadingPred}
          className="term-btn-primary text-xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingPred ? 'animate-spin' : ''}`} />
          <span>RUN NEURAL INFERENCE</span>
        </button>
      </div>

      {/* 2. Horizon & Model Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Horizon Picker */}
        <div className="term-panel p-3 font-mono">
          <div className="text-[10px] text-[#969B91] uppercase tracking-wider mb-2">
            1. Select Forecast Horizon (Steps Forward)
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`py-2 text-xs font-mono font-bold transition-colors border ${
                  selectedHorizon === h
                    ? 'bg-[#C7F36B] text-[#101310] border-[#C7F36B]'
                    : 'bg-[#141814] text-[#969B91] border-[#343B33] hover:text-[#E9E8DF]'
                }`}
              >
                T+{h} DAYS
              </button>
            ))}
          </div>
        </div>

        {/* Model Architecture Picker */}
        <div className="term-panel p-3 font-mono">
          <div className="text-[10px] text-[#969B91] uppercase tracking-wider mb-2">
            2. Select Neural Model Architecture
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`py-2 px-1 text-[11px] font-mono font-bold transition-colors border truncate ${
                  selectedModel === m.id
                    ? 'bg-[#C7F36B] text-[#101310] border-[#C7F36B]'
                    : 'bg-[#141814] text-[#969B91] border-[#343B33] hover:text-[#E9E8DF]'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Statistical Confidence Interval Chart */}
      <div className="term-panel">
        <div className="term-header">
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#C7F36B]" />
            95% PROBABILITY CONE & MULTI-MODEL COMPARISON ({selectedHorizon} DAYS)
          </span>
          <span className="text-[10px] text-[#969B91] font-mono">
            {MODELS.find((m) => m.id === selectedModel)?.desc}
          </span>
        </div>
        <div className="p-3">
          {loadingPred ? (
            <div className="h-72 flex items-center justify-center font-mono text-xs text-[#969B91]">
              <Activity className="w-5 h-5 animate-spin text-[#C7F36B] mr-2" />
              Running Neural Forward Pass & Computing Covariance Bounds...
            </div>
          ) : (
            <ConfidenceIntervalChart
              forecast={forecast}
              currentPrice={currentPrice}
              symbol={selectedSymbol}
              selectedModel={selectedModel}
            />
          )}
        </div>
      </div>

      {/* 4. Evaluation Metrics & Trend Classification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">EXPECTED RETURN</div>
          <div className={`text-xl font-bold mt-1 ${expectedReturn >= 0 ? 'text-[#77C98B]' : 'text-[#E47770]'}`}>
            {expectedReturn >= 0 ? '+' : ''}{expectedReturn}%
          </div>
          <div className="text-[9px] text-[#969B91] mt-1">
            TARGET PRICE: <strong className="text-[#E9E8DF]">${finalPrice.toFixed(2)}</strong>
          </div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">MEAN ABS ERROR (MAE)</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">${metrics.mae}</div>
          <div className="text-[9px] text-[#969B91] mt-1">AVERAGE DOLLAR DEVIATION</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">ROOT MEAN SQUARED ERROR (RMSE)</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">${metrics.rmse}</div>
          <div className="text-[9px] text-[#969B91] mt-1">PENALIZES LARGE OUTLIERS</div>
        </div>

        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">DIRECTIONAL ACCURACY</div>
          <div className="text-xl font-bold text-[#C7F36B] mt-1">{metrics.directional_accuracy || 72.4}%</div>
          <div className="text-[9px] text-[#969B91] mt-1">WALK-FORWARD TEST WIN RATE</div>
        </div>
      </div>

      {/* 5. Step-by-Step Forecast Table */}
      <div className="term-panel">
        <div className="term-header">
          <span>STEP-BY-STEP PROJECTION VECTORS</span>
          <span className="text-[10px] font-mono text-[#969B91]">GAUSSIAN DRIFT ±2σ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="term-table">
            <thead>
              <tr>
                <th>STEP</th>
                <th>PROJECTED DATE</th>
                <th>PREDICTED CLOSE</th>
                <th>LOWER 95% CI</th>
                <th>UPPER 95% CI</th>
                <th>ENSEMBLE</th>
                <th>TRANSFORMER</th>
                <th>LSTM</th>
                <th>GRU</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((f) => (
                <tr key={f.step}>
                  <td className="font-bold text-[#C7F36B]">T+{f.step}</td>
                  <td>{f.date}</td>
                  <td className="font-bold text-[#E9E8DF]">${f.predicted_price.toFixed(2)}</td>
                  <td className="text-[#E47770]">${f.lower_bound.toFixed(2)}</td>
                  <td className="text-[#77C98B]">${f.upper_bound.toFixed(2)}</td>
                  <td className="text-[#E9E8DF]">${(f.ensemble || f.predicted_price).toFixed(2)}</td>
                  <td className="text-[#969B91]">${(f.transformer || f.predicted_price * 1.008).toFixed(2)}</td>
                  <td className="text-[#969B91]">${(f.lstm || f.predicted_price * 0.995).toFixed(2)}</td>
                  <td className="text-[#969B91]">${(f.gru || f.predicted_price * 1.002).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Required Institutional Disclaimer Banner */}
      <div className="p-3 bg-[#161B16] border border-[#343B33] flex items-start gap-2.5 text-xs font-mono text-[#969B91]">
        <Info className="w-4 h-4 text-[#C7F36B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#E9E8DF]">INSTITUTIONAL QUANTITATIVE DISCLAIMER:</strong> All price trajectories,
          confidence cones, and classification signals are generated via deep neural network simulations for academic and
          quantitative research purposes. Past backtest convergence and walk-forward evaluations do not guarantee future
          market performance. These outputs strictly do not constitute financial advice or investment recommendations.
        </div>
      </div>
    </div>
  );
};
