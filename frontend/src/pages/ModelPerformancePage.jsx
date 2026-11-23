import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LineChart as ChartIcon, Cpu, Layers, Award, Activity, Database, CheckCircle2 } from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';

// Synthetic loss convergence data across 25 training epochs
const CONVERGENCE_DATA = [
  { epoch: 1, transformer_val: 0.084, ensemble_val: 0.078, lstm_val: 0.092, gru_val: 0.089 },
  { epoch: 5, transformer_val: 0.052, ensemble_val: 0.046, lstm_val: 0.061, gru_val: 0.058 },
  { epoch: 10, transformer_val: 0.034, ensemble_val: 0.029, lstm_val: 0.042, gru_val: 0.039 },
  { epoch: 15, transformer_val: 0.024, ensemble_val: 0.019, lstm_val: 0.031, gru_val: 0.028 },
  { epoch: 20, transformer_val: 0.018, ensemble_val: 0.014, lstm_val: 0.025, gru_val: 0.022 },
  { epoch: 25, transformer_val: 0.015, ensemble_val: 0.011, lstm_val: 0.021, gru_val: 0.019 },
];

const ARCHITECTURES = [
  {
    name: 'Stacking Meta-Ensemble',
    type: 'Ridge / GBDT Meta-Learner',
    layers: 'Meta-Level Stacking',
    hidden: 'Combiner Weights [0.42, 0.28, 0.30]',
    latency: '42ms',
    mape: '1.42%',
    dirAcc: '72.4%',
    desc: 'Combines Transformer attention weights with LSTM and GRU hidden representations to mitigate single-model variance.',
    isPrimary: true,
  },
  {
    name: 'Temporal Transformer',
    type: 'Multi-Head Attention',
    layers: '4 Encoder Layers',
    hidden: 'd_model=128, n_heads=4',
    latency: '36ms',
    mape: '1.58%',
    dirAcc: '70.8%',
    desc: 'Captures long-range macroeconomic dependencies and regime changes through self-attention without recurrence bottleneck.',
    isPrimary: false,
  },
  {
    name: 'Bidirectional LSTM',
    type: 'Recurrent Neural Network',
    layers: '3 LSTM Layers + Dropout',
    hidden: 'Hidden Dim=128, Dropout=0.2',
    latency: '18ms',
    mape: '1.82%',
    dirAcc: '68.2%',
    desc: 'Maintains long-term memory cells and forget gates; excels in continuous trending market environments.',
    isPrimary: false,
  },
  {
    name: 'Gated Recurrent Unit (GRU)',
    type: 'Optimized Recurrent Net',
    layers: '3 GRU Layers',
    hidden: 'Hidden Dim=128, Dropout=0.2',
    latency: '14ms',
    mape: '1.76%',
    dirAcc: '69.1%',
    desc: 'Streamlined update/reset gating mechanisms offering fast parameter convergence and rapid gradient propagation.',
    isPrimary: false,
  },
];

export const ModelPerformancePage = () => {
  const { selectedSymbol } = useTerminal();

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header Bar */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              DEEP LEARNING MODEL PERFORMANCE & LOSS PROFILES
            </span>
            <span className="term-badge-accent">PYTORCH 2.2</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Walk-Forward Validation, Hyperparameter Specs & Out-of-Sample Convergence Metrics
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-[#141814] border border-[#343B33] text-[#969B91]">
            ACTIVE BENCHMARK: <strong className="text-[#C7F36B]">{selectedSymbol}</strong>
          </span>
          <span className="px-2 py-1 bg-[#141814] border border-[#343B33] text-[#77C98B]">
            HARDWARE: CUDA ACCELERATED
          </span>
        </div>
      </div>

      {/* 2. Loss Convergence Chart */}
      <div className="term-panel">
        <div className="term-header">
          <span className="flex items-center gap-1.5 text-[#C7F36B]">
            <ChartIcon className="w-3.5 h-3.5" />
            OUT-OF-SAMPLE VALIDATION LOSS CONVERGENCE (MSE)
          </span>
          <span className="text-[10px] font-mono text-[#969B91]">25 EPOCHS • ADAMW OPTIMIZER</span>
        </div>

        <div className="p-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CONVERGENCE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#242B24" vertical={false} />
                <XAxis
                  dataKey="epoch"
                  stroke="#969B91"
                  tick={{ fill: '#969B91', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  tickFormatter={(ep) => `Epoch ${ep}`}
                />
                <YAxis
                  stroke="#969B91"
                  tick={{ fill: '#969B91', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  tickFormatter={(v) => v.toFixed(3)}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141814', borderColor: '#343B33', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', paddingTop: '10px' }} />

                <Line
                  type="monotone"
                  dataKey="ensemble_val"
                  name="Stacking Ensemble"
                  stroke="#C7F36B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#C7F36B' }}
                />
                <Line
                  type="monotone"
                  dataKey="transformer_val"
                  name="Temporal Transformer"
                  stroke="#38BDF8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="gru_val"
                  name="GRU Network"
                  stroke="#F59E0B"
                  strokeWidth={1}
                />
                <Line
                  type="monotone"
                  dataKey="lstm_val"
                  name="LSTM Network"
                  stroke="#A78BFA"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Deep Learning Architecture Comparison Matrix */}
      <div className="term-panel">
        <div className="term-header">
          <span>MODEL ARCHITECTURE & HYPERPARAMETER SPECIFICATIONS</span>
          <span className="text-[10px] font-mono text-[#969B91]">4 ACTIVE ENGINES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="term-table">
            <thead>
              <tr>
                <th>ARCHITECTURE</th>
                <th>NETWORK PARADIGM</th>
                <th>LAYERS / DEPTH</th>
                <th>LATENCY</th>
                <th>TEST MAPE</th>
                <th>WIN RATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {ARCHITECTURES.map((arch) => (
                <tr key={arch.name}>
                  <td>
                    <div className="font-bold text-[#E9E8DF]">{arch.name}</div>
                    <div className="text-[10px] text-[#969B91] max-w-xs">{arch.desc}</div>
                  </td>
                  <td className="text-[#969B91]">{arch.type}</td>
                  <td className="text-[#969B91]">{arch.layers}</td>
                  <td className="font-bold text-[#C7F36B]">{arch.latency}</td>
                  <td className="font-bold text-[#77C98B]">{arch.mape}</td>
                  <td className="font-bold text-[#E9E8DF]">{arch.dirAcc}</td>
                  <td>
                    {arch.isPrimary ? (
                      <span className="term-badge-accent">PRIMARY META</span>
                    ) : (
                      <span className="term-badge-neutral">ENSEMBLE BASE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Training Infrastructure Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">SEQUENCE LOOKBACK</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">60 BARS (DAILY)</div>
          <div className="text-[9px] text-[#969B91] mt-1">ROLLING FEATURE VECTOR</div>
        </div>
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">OPTIMIZER & LOSS</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">AdamW + Huber Loss</div>
          <div className="text-[9px] text-[#969B91] mt-1">ROBUST TO PRICE SPIKES</div>
        </div>
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">LEARNING RATE</div>
          <div className="text-xl font-bold text-[#E9E8DF] mt-1">1e-4 Cosine Anneal</div>
          <div className="text-[9px] text-[#969B91] mt-1">WARMUP 5 EPOCHS</div>
        </div>
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">INPUT FEATURES</div>
          <div className="text-xl font-bold text-[#C7F36B] mt-1">16 DESCRIPTORS</div>
          <div className="text-[9px] text-[#969B91] mt-1">OHLCV + RSI + MACD + BB</div>
        </div>
      </div>
    </div>
  );
};
