import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  LogOut,
  X,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { apiClient } from '../services/api';

/* ── Branded Google SVG Icon ── */
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/* ── Branded GitHub SVG Icon ── */
const GitHubIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const AuthModal = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onRegister,
  onLogout,
  onExitGuest,
}) => {
  // Modes: 'login' | 'register' | 'forgot_request' | 'forgot_reset'
  const [modalMode, setModalMode] = useState('login');

  const [username, setUsername] = useState('demotrader');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demopass');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchMode = (newMode) => {
    clearMessages();
    setModalMode(newMode);
    if (newMode === 'login') {
      setUsername('demotrader');
      setPassword('demopass');
    } else if (newMode === 'register') {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
    }
  };

  /* ── 1. Login Handler ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await onLogin(username.trim(), password);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 2. Register Handler ── */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await onRegister({
        email: email.trim(),
        username: username.trim(),
        password,
        confirm_password: confirmPassword,
        full_name: fullName.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 3. Forgot Password Request Handler ── */
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) {
      setErrorMsg('Please enter your account email.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.forgotPassword(email.trim());
      setSuccessMsg(res.message || 'OTP sent to your email.');
      if (res.dev_otp) setDevOtpHint(res.dev_otp);
      setPassword('');
      setConfirmPassword('');
      setModalMode('forgot_reset');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch reset code.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 4. Forgot Password Reset Handler ── */
  const handleForgotReset = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.resetPassword(email.trim(), otpCode.trim(), password, confirmPassword);
      await onLogin(email.trim(), password);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 5. OAuth Handler ── */
  const handleOAuth = async (provider) => {
    clearMessages();
    setLoading(true);
    try {
      const res = await apiClient.oauthLogin(provider);
      if (onLogin) await onLogin(res.user.email, 'oauth-dummy');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || `${provider} login failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="auth-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card modal-content max-w-md w-full p-6 border border-white/15 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono tracking-tight">
              {user
                ? 'Account Profile'
                : modalMode === 'register'
                ? 'Register Account'
                : modalMode === 'forgot_request'
                ? 'Reset Password'
                : modalMode === 'forgot_reset'
                ? 'Enter Verification Code'
                : 'Sign In'}
            </h3>
          </div>
          <button
            data-testid="auth-modal-close"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div data-testid="auth-error-msg" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div data-testid="auth-success-msg" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── LOGGED IN VIEW ── */}
        {user ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                Active Authenticated Session
              </div>
              <div data-testid="auth-logged-in-username" className="text-base font-bold text-white font-mono">{user.username}</div>
              <div className="text-xs text-slate-400 font-mono">{user.email}</div>
              {user.full_name && (
                <div className="text-xs text-slate-300">{user.full_name}</div>
              )}
              <div className="text-[11px] text-slate-500 font-mono truncate">
                Session ID: {user.id || 'live-jwt'}
              </div>
            </div>

            <button
              data-testid="auth-logout-btn"
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
          /* ── UNAUTHENTICATED FORMS ── */
          <div className="space-y-4">
            {/* Tabs for Login / Register */}
            {(modalMode === 'login' || modalMode === 'register') && (
              <div className="flex rounded-lg p-1 bg-[#050811] border border-white/10">
                <button
                  type="button"
                  data-testid="auth-tab-login"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                    modalMode === 'login'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  data-testid="auth-tab-register"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                    modalMode === 'register'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Login Form */}
            {modalMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      data-testid="login-username-input"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-slate-400">Password</label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot_request')}
                      className="text-[11px] font-mono text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      data-testid="login-password-input"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="login-submit-btn"
                  disabled={loading}
                  className="w-full btn-primary text-xs font-mono py-2.5 justify-center flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                </button>
              </form>
            )}

            {/* Register Form */}
            {modalMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      data-testid="register-email-input"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@domain.com"
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      data-testid="register-username-input"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="quant_trader"
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      data-testid="register-password-input"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      data-testid="register-confirm-password-input"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="register-submit-btn"
                  disabled={loading}
                  className="w-full btn-primary text-xs font-mono py-2.5 justify-center flex items-center gap-2 mt-1"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Creating...' : 'Register Account'}</span>
                </button>
              </form>
            )}

            {/* Forgot Password Request */}
            {modalMode === 'forgot_request' && (
              <form onSubmit={handleForgotRequest} className="space-y-3.5">
                <p className="text-xs text-slate-400 font-mono">
                  Enter your registered email address to receive a 6-digit OTP code:
                </p>
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-xs font-mono py-2.5 justify-center flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Send OTP Code</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs font-mono text-slate-400 hover:text-white"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Forgot Password Reset Form */}
            {modalMode === 'forgot_reset' && (
              <form onSubmit={handleForgotReset} className="space-y-3">
                <div className="text-xs font-mono text-cyan-400 bg-[#090d16] p-2 rounded-lg border border-white/5 truncate">
                  Target: {email}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold tracking-widest text-center text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-xs font-mono py-2.5 justify-center flex items-center gap-2 mt-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reset Password & Sign In</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400">
                  <button type="button" onClick={() => switchMode('forgot_request')} className="hover:text-white">
                    ← Resend OTP
                  </button>
                  <button type="button" onClick={() => switchMode('login')} className="text-cyan-400 hover:text-cyan-300">
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* OAuth Buttons */}
            {(modalMode === 'login' || modalMode === 'register') && (
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Or authenticate with
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    disabled={loading}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <GoogleIcon />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth('github')}
                    disabled={loading}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <GitHubIcon />
                    <span>GitHub</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
