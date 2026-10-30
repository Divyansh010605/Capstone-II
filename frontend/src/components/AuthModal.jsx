import React, { useState } from 'react';
import { User, Key, Mail, Lock, ShieldCheck, LogOut } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, user, onLogin, onRegister, onLogout }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('demotrader');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isRegisterMode) {
        await onRegister({ username, email, password, full_name: fullName });
      } else {
        await onLogin(username, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 border border-white/10 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white font-mono">
              {user ? 'Account Session' : isRegisterMode ? 'Register Account' : 'Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-mono">
            Close
          </button>
        </div>

        {user ? (
          // Authenticated Session View
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                JWT Token Active
              </div>
              <div className="text-sm font-bold text-white">{user.username}</div>
              <div className="text-xs text-slate-400 font-mono">{user.email}</div>
              <div className="text-[11px] text-slate-500 font-mono">ID: {user.id}</div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full btn-secondary text-rose-400 border-rose-500/20 hover:bg-rose-500/10 justify-center text-xs font-mono py-2.5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          // Auth Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Username / Identifier</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090d16] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Satoshi Nakamoto"
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary justify-center text-xs font-mono py-2.5">
              {isRegisterMode ? 'Create Account' : 'Authenticate (JWT)'}
            </button>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
              {isRegisterMode ? 'Already registered?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-blue-400 hover:underline font-bold"
              >
                {isRegisterMode ? 'Sign In' : 'Register Here'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
