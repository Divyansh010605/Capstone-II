import React, { useState, useEffect } from 'react';
import { User, Key, Mail, Lock, ShieldCheck, LogOut, X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, user, onLogin, onRegister, onLogout }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('demotrader');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isRegisterMode) {
        await onRegister({ username, email, password, full_name: fullName });
      } else {
        await onLogin(username, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card modal-content max-w-md w-full p-6 border border-white/15 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono tracking-tight">
              {user ? 'Account Session' : isRegisterMode ? 'Register Account' : 'Sign In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          // Authenticated Session View
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                Active JWT Bearer Session
              </div>
              <div className="text-base font-bold text-white">{user.username}</div>
              <div className="text-xs text-slate-400 font-mono">{user.email}</div>
              <div className="text-[11px] text-slate-500 font-mono">User ID: {user.id}</div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full btn-secondary text-rose-400 border-rose-500/20 hover:bg-rose-500/10 justify-center text-xs font-mono py-2.5 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Session
            </button>
          </div>
        ) : (
          // Auth Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Username / Identifier</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Financial Analyst"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs font-mono py-2.5 justify-center flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : isRegisterMode ? 'Create Account' : 'Sign In'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg('');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
              >
                {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
