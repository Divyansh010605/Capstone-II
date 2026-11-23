import React, { useState, useEffect } from 'react';
import { Search, Activity, Clock, Shield, User, LogOut, ChevronDown, FileCode } from 'lucide-react';
import { useTerminal } from '../../context/TerminalContext';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const {
    selectedSymbol,
    changeSymbol,
    availableStocks,
    isBackendOnline,
    apiLatency,
    user,
    logout,
  } = useTerminal();

  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [clocks, setClocks] = useState({
    utc: '',
    est: '',
    ist: '',
  });

  // Clocks update
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setClocks({
        utc: now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        est: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' }),
        ist: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' }),
      });
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectTicker = (sym) => {
    changeSymbol(sym);
    setSearchInput('');
    setIsSearchOpen(false);
  };

  const filteredStocks = (availableStocks || []).filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchInput.toLowerCase()))
  ).slice(0, 8);

  return (
    <header className="h-12 bg-[#141814] border-b border-[#343B33] flex items-center justify-between px-3 md:px-4 z-40 select-none">
      {/* Left: Brand & Active Ticker Switcher */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer flex items-center gap-2 pr-3 border-r border-[#343B33]"
        >
          <div className="w-6 h-6 bg-[#C7F36B] text-[#101310] flex items-center justify-center font-heading font-black text-xs">
            AQ
          </div>
          <div className="hidden sm:block">
            <div className="font-heading font-bold text-xs tracking-wider text-[#E9E8DF]">
              ALPHAQUANT
            </div>
            <div className="font-mono text-[9px] text-[#969B91] tracking-widest leading-none">
              INSTITUTIONAL v2.4
            </div>
          </div>
        </div>

        {/* Global Ticker Quick-Search */}
        <div className="relative">
          <div className="flex items-center bg-[#101310] border border-[#343B33] focus-within:border-[#C7F36B] px-2 py-1">
            <Search className="w-3.5 h-3.5 text-[#969B91] mr-1.5" />
            <input
              type="text"
              placeholder={`ACTIVE: ${selectedSymbol}`}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchInput.trim()) {
                  handleSelectTicker(searchInput.trim());
                }
                if (e.key === 'Escape') setIsSearchOpen(false);
              }}
              className="bg-transparent text-xs font-mono text-[#E9E8DF] outline-none w-28 md:w-36 uppercase placeholder:text-[#969B91]"
            />
            <span className="text-[10px] font-mono text-[#969B91] px-1 bg-[#191E19] border border-[#343B33]">
              {selectedSymbol}
            </span>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchInput.trim() && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-[#191E19] border border-[#343B33] shadow-2xl z-50 font-mono text-xs max-h-60 overflow-y-auto">
              <div className="p-1.5 text-[10px] text-[#969B91] border-b border-[#343B33] font-heading font-semibold uppercase">
                Matching Equities
              </div>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectTicker(stock.symbol)}
                    className="px-3 py-2 hover:bg-[#202720] cursor-pointer flex items-center justify-between border-b border-[#242B24] last:border-b-0"
                  >
                    <div>
                      <span className="font-bold text-[#E9E8DF]">{stock.symbol}</span>
                      <div className="text-[10px] text-[#969B91] truncate max-w-[140px]">{stock.name}</div>
                    </div>
                    <span className="text-[10px] text-[#C7F36B] bg-[#C7F36B]/10 px-1 py-0.5 border border-[#C7F36B]/20">
                      SELECT
                    </span>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => handleSelectTicker(searchInput)}
                  className="p-3 text-xs text-[#969B91] hover:bg-[#202720] cursor-pointer"
                >
                  Load custom symbol: <strong className="text-[#C7F36B]">{searchInput.toUpperCase()}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Clocks & Market Sessions */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-[#969B91]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#C7F36B]" />
          <span>UTC: <strong className="text-[#E9E8DF]">{clocks.utc}</strong></span>
          <span className="text-[#343B33]">|</span>
          <span>EST: <strong className="text-[#E9E8DF]">{clocks.est}</strong></span>
          <span className="text-[#343B33]">|</span>
          <span>IST: <strong className="text-[#E9E8DF]">{clocks.ist}</strong></span>
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-[#343B33]">
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-[#77C98B]/10 text-[#77C98B] border border-[#77C98B]/30 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#77C98B] animate-pulse"></span>
            NYSE: OPEN
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-[#343B33] text-[#969B91] border border-[#475245]">
            NSE: CLOSED
          </span>
        </div>
      </div>

      {/* Right: Engine Status & Auth */}
      <div className="flex items-center gap-3">
        {/* Backend Status Pill */}
        <button
          onClick={() => navigate('/docs')}
          title="Open Swagger & OpenAPI Specification"
          className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border border-[#343B33] bg-[#202720] hover:bg-[#283228] text-[#E9E8DF] transition-colors"
        >
          <FileCode className="w-3 h-3 text-[#C7F36B]" />
          <span>SWAGGER API</span>
        </button>

        <div
          title={isBackendOnline ? `FastAPI Backend Online (${apiLatency || 12}ms)` : 'In-Memory Fallback Active'}
          className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 border ${
            isBackendOnline
              ? 'bg-[#77C98B]/10 text-[#77C98B] border-[#77C98B]/30'
              : 'bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendOnline ? 'bg-[#77C98B]' : 'bg-[#C7F36B]'
            }`}
          />
          <span>{isBackendOnline ? `CORE: ${apiLatency || 12}ms` : 'STANDALONE'}</span>
        </div>

        {/* User Session Profile */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[#343B33]">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#E9E8DF]">
              <div className="w-6 h-6 bg-[#202720] border border-[#343B33] flex items-center justify-center text-[#C7F36B] font-bold text-[11px]">
                {user.username ? user.username.slice(0, 2).toUpperCase() : 'TR'}
              </div>
              <span className="hidden md:inline font-semibold text-xs">{user.username}</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              title="Terminate Session / Sign Out"
              className="p-1 text-[#969B91] hover:text-[#E47770] hover:bg-[#202720] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="term-btn-primary text-[11px] py-1 px-2.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
