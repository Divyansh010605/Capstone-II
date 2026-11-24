import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Activity,
  Database,
  User,
  Key,
  LogOut,
  RefreshCw,
  Server,
  CheckCircle2,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const { user, isBackendOnline, apiLatency, logout, refreshMarket } = useTerminal();
  const navigate = useNavigate();

  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    localStorage.removeItem('cached_market_data');
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header Bar */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              PLATFORM SETTINGS & SYSTEM DIAGNOSTICS
            </span>
            <span className="term-badge-accent">CONFIG v2.4</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            API Endpoints, Authentication Session Tokens & Computational Hardware Engines
          </p>
        </div>

        {user ? (
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="term-btn-secondary text-xs flex items-center gap-1.5 text-[#E47770] border-[#E47770]/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>TERMINATE SESSION</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="term-btn-primary text-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>SIGN IN TO ACCOUNT</span>
          </button>
        )}
      </div>

      {/* 2. Account Profile & Access Permissions */}
      <div className="term-panel font-mono">
        <div className="term-header">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#C7F36B]" />
            ACTIVE RESEARCHER IDENTITY
          </span>
          <span className="text-[10px] text-[#969B91]">JWT RSA-256</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#121512] border border-[#242B24]">
            <span className="text-[10px] text-[#969B91] block">USERNAME</span>
            <span className="font-bold text-[#E9E8DF] text-sm">{user?.username || 'GUEST_QUANT'}</span>
          </div>
          <div className="p-3 bg-[#121512] border border-[#242B24]">
            <span className="text-[10px] text-[#969B91] block">REGISTERED EMAIL</span>
            <span className="font-bold text-[#E9E8DF] text-sm">{user?.email || 'quant@alphaquant.terminal'}</span>
          </div>
          <div className="p-3 bg-[#121512] border border-[#242B24]">
            <span className="text-[10px] text-[#969B91] block">CLEARANCE TIER</span>
            <span className="font-bold text-[#C7F36B] text-sm">INSTITUTIONAL QUANT (FULL API ACCESS)</span>
          </div>
        </div>
      </div>

      {/* 3. Backend Diagnostics & Node Health */}
      <div className="term-panel font-mono">
        <div className="term-header">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#C7F36B]" />
            FASTAPI RUNTIME DIAGNOSTICS
          </span>
          <span className="text-[10px] text-[#969B91]">SYSTEM STATUS</span>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-[#121512] border border-[#242B24]">
            <div>
              <span className="font-bold text-[#E9E8DF] block">FASTAPI BACKEND GATEWAY</span>
              <span className="text-[10px] text-[#969B91]">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : 'https://localhost/api/v1'}
              </span>
            </div>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold border ${
                isBackendOnline
                  ? 'border-[#77C98B] text-[#77C98B] bg-[#77C98B]/10'
                  : 'border-[#C7F36B] text-[#C7F36B] bg-[#C7F36B]/10'
              }`}
            >
              {isBackendOnline ? `ONLINE (${apiLatency || 12}ms)` : 'STANDALONE IN-MEMORY'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">MARKET TICKS</span>
              <span className="text-[#77C98B] font-bold">200 OK (yfinance)</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">NEURAL MODELS</span>
              <span className="text-[#77C98B] font-bold">4 PyTorch Modules</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">MONTE CARLO</span>
              <span className="text-[#77C98B] font-bold">10k Path Engine</span>
            </div>
            <div className="p-2.5 bg-[#121512] border border-[#242B24]">
              <span className="text-[10px] text-[#969B91] block">NLP LEXICON</span>
              <span className="text-[#77C98B] font-bold">VADER Lexicon Ready</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 border-t border-[#242B24]">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="term-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>NATIVE SWAGGER UI (/docs)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => navigate('/docs')}
              className="term-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>API DOCS & POSTMAN CENTER</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Local Storage & Terminal Maintenance */}
      <div className="term-panel font-mono p-4">
        <div className="font-heading font-bold text-xs text-[#E9E8DF] uppercase tracking-wide mb-2">
          Terminal Maintenance & Storage
        </div>
        <p className="text-xs text-[#969B91] mb-3">
          Purge client-side cached ticker data and reset local state to synchronize with upstream nodes.
        </p>

        <button
          onClick={handleClearCache}
          className="term-btn-secondary text-xs flex items-center gap-1.5"
        >
          {cleared ? <CheckCircle2 className="w-3.5 h-3.5 text-[#77C98B]" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{cleared ? 'CACHE CLEARED' : 'PURGE LOCAL TERMINAL CACHE'}</span>
        </button>
      </div>
    </div>
  );
};
