import React, { useState } from 'react';
import {
  TrendingUp,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
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

export const AuthPage = ({ onLoginSuccess, onExploreGuest }) => {
  // Modes: 'login' | 'register' | 'forgot_request' | 'forgot_reset'
  const [authMode, setAuthMode] = useState('login');

  // Form states
  const [username, setUsername] = useState('demotrader');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demopass');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchMode = (newMode) => {
    clearMessages();
    setAuthMode(newMode);
    if (newMode === 'login') {
      setUsername('demotrader');
      setPassword('demopass');
    } else if (newMode === 'register') {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  /* ── 1. Handle Login Submit ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.login(username.trim(), password);
      setSuccessMsg('Authentication successful! Initializing quantitative workspace...');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user, data.access_token);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 2. Handle Register Submit ── */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !username.trim() || !password || !confirmPassword) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.register({
        email: email.trim(),
        username: username.trim(),
        password,
        confirm_password: confirmPassword,
      });

      // Auto-login after registration
      const loginData = await apiClient.login(username.trim(), password);
      setSuccessMsg('Account created successfully! Welcome aboard.');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(loginData.user, loginData.access_token);
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Username or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 3. Handle Forgot Password: Step 1 (Request OTP) ── */
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setErrorMsg('Please provide your registered account email.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.forgotPassword(email.trim());
      setSuccessMsg(res.message || '6-digit OTP verification code sent to your email.');
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
      setPassword('');
      setConfirmPassword('');
      setAuthMode('forgot_reset');
    } catch (err) {
      setErrorMsg(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 4. Handle Forgot Password: Step 2 (Reset Password with OTP) ── */
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg('Please provide both new password and confirmation.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.resetPassword(email.trim(), otpCode.trim(), password, confirmPassword);
      setSuccessMsg(res.message || 'Password reset successful! Logging you in...');

      // Auto login with new password
      const loginData = await apiClient.login(email.trim(), password);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(loginData.user, loginData.access_token);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Please check OTP code.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 5. Handle OAuth Login (Google & GitHub) ── */
  const handleOAuthLogin = async (provider) => {
    clearMessages();
    setLoading(true);
    try {
      const defaultProfiles = {
        google: {
          email: 'trader.google@gmail.com',
          name: 'Google Quant Trader',
          username: 'google_trader',
        },
        github: {
          email: 'dev.github@github.com',
          name: 'GitHub Engineer',
          username: 'github_quant',
        },
      };

      const res = await apiClient.oauthLogin(provider, defaultProfiles[provider] || {});
      setSuccessMsg(`Authenticated via ${provider.toUpperCase()}! Redirecting...`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(res.user, res.access_token);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || `${provider} OAuth sign in failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Glow & FinTech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Stock Market AI Quantitative Platform
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/20">
              <TrendingUp className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              ALPHA<span className="text-cyan-400">QUANT</span>
            </h1>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            {authMode === 'login' && 'Sign in to access deep-learning forecasts & portfolio risk'}
            {authMode === 'register' && 'Create your institutional trading analytics account'}
            {authMode === 'forgot_request' && 'Reset your password via verified 6-digit email OTP'}
            {authMode === 'forgot_reset' && 'Enter your verification OTP and choose a new password'}
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-[#090d16]/90 relative">
          {/* Top Mode Navigation Tabs (Sign In / Register) */}
          {(authMode === 'login' || authMode === 'register') && (
            <div className="flex rounded-xl p-1 bg-[#050811] border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Notifications & Error Banners */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Dev OTP Helper Banner */}
          {devOtpHint && authMode === 'forgot_reset' && (
            <div className="mb-5 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Dev OTP: <strong className="text-white tracking-widest">{devOtpHint}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(devOtpHint)}
                className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-[11px] font-bold text-cyan-300 border border-cyan-500/30 transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* ══════════════ 1. LOGIN FORM ══════════════ */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="demotrader"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-300 font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot_request')}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ══════════════ 2. REGISTER FORM ══════════════ */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@domain.com"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 font-medium">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alpha_quant"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300 font-medium">
                    Confirm Password
                  </label>
                  {confirmPassword && (
                    <span
                      className={`text-[11px] font-mono ${
                        password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {password === confirmPassword ? 'Passwords match' : 'Does not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full bg-[#050811] border rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-rose-500/50 focus:border-rose-500'
                        : 'border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ══════════════ 3. FORGOT PASSWORD (STEP 1: REQUEST OTP) ══════════════ */}
          {authMode === 'forgot_request' && (
            <form onSubmit={handleForgotRequestSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-slate-300 text-xs font-mono leading-relaxed">
                Enter your registered email address. We will generate and dispatch a secure 6-digit verification OTP code.
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 font-medium">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@domain.com"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Verification Code (OTP)</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ══════════════ 4. FORGOT PASSWORD (STEP 2: VERIFY OTP & RESET) ══════════════ */}
          {authMode === 'forgot_reset' && (
            <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-xl bg-[#050811] border border-white/5">
                <span className="text-slate-400">Target Email:</span>
                <span className="text-cyan-400 font-bold truncate max-w-[200px]">{email}</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 font-medium">
                  6-Digit Verification Code (OTP)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono font-bold tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min. 6 chars)"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300 font-medium">
                    Confirm New Password
                  </label>
                  {confirmPassword && (
                    <span
                      className={`text-[11px] font-mono ${
                        password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {password === confirmPassword ? 'Passwords match' : 'Does not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('forgot_request')}
                  className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  ← Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ══════════════ OAUTH SECTION (GOOGLE & GITHUB) ══════════════ */}
          {(authMode === 'login' || authMode === 'register') && (
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3.5">
              <div className="relative text-center">
                <span className="bg-[#090d16] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider relative z-10">
                  Or continue with
                </span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm group"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>

                {/* GitHub OAuth Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm group"
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Guest Explorer & Security Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 px-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>256-Bit JWT & SHA-256 Protection</span>
          </div>

          {onExploreGuest && (
            <button
              type="button"
              onClick={onExploreGuest}
              className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 group"
            >
              <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
              <span className="underline underline-offset-2">Explore as Guest</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
