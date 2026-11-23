import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Activity,
  Terminal,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';
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

export const AuthPage = () => {
  const { login, register, oauthLogin, setGuestMode } = useTerminal();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot_request' | 'forgot_reset'
  const [authMode, setAuthMode] = useState('login');

  // Form states
  const [username, setUsername] = useState('demotrader');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demopass');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [oauthConfig, setOauthConfig] = useState({ google_client_id: '', github_client_id: '' });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch OAuth Config and Handle Incoming OAuth Redirects
  useEffect(() => {
    let active = true;

    async function initOAuth() {
      try {
        const cfg = await apiClient.getOAuthConfig();
        if (active && cfg) setOauthConfig(cfg);
      } catch {
        // Ignore
      }

      // Check for Google OAuth hash callback: #access_token=...
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const googleToken = params.get('access_token');
        if (googleToken) {
          setLoading(true);
          try {
            await oauthLogin('google', { oauth_token: googleToken });
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/overview');
            return;
          } catch (err) {
            setErrorMsg(err.message || 'Google authentication failed');
            setLoading(false);
          }
        }
      }

      // Check for GitHub OAuth search query callback: ?code=...
      const search = window.location.search;
      if (search && search.includes('code=')) {
        const params = new URLSearchParams(search);
        const code = params.get('code');
        if (code) {
          setLoading(true);
          try {
            await oauthLogin('github', { code });
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/overview');
            return;
          } catch (err) {
            setErrorMsg(err.message || 'GitHub authentication failed');
            setLoading(false);
          }
        }
      }
    }

    initOAuth();
    return () => { active = false; };
  }, [oauthLogin, navigate]);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(username, password);
        navigate('/overview');
      } else if (authMode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({ username, email, password });
        await login(username, password);
        navigate('/overview');
      } else if (authMode === 'forgot_request') {
        const res = await apiClient.forgotPassword(email);
        setDevOtpHint(res.dev_otp || '');
        setSuccessMsg(res.message || 'Verification code dispatched to your email.');
        setAuthMode('forgot_reset');
      } else if (authMode === 'forgot_reset') {
        if (password !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await apiClient.resetPassword(email, otpCode, password, confirmPassword);
        setSuccessMsg('Password updated successfully. Please authenticate.');
        switchMode('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    clearMessages();

    // 1. Live Google OAuth Redirect with Account Chooser
    if (provider === 'google') {
      const clientId = oauthConfig.google_client_id;
      if (clientId) {
        const redirectUri = `${window.location.origin}/auth`;
        const googleAuthUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(clientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=token&` +
          `scope=${encodeURIComponent('openid email profile')}&` +
          `prompt=select_account`;
        window.location.href = googleAuthUrl;
        return;
      }
    }

    // 2. Live GitHub OAuth Redirect
    if (provider === 'github') {
      const clientId = oauthConfig.github_client_id;
      if (clientId) {
        const redirectUri = `${window.location.origin}/auth`;
        const githubAuthUrl =
          `https://github.com/login/oauth/authorize?` +
          `client_id=${encodeURIComponent(clientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=user:email`;
        window.location.href = githubAuthUrl;
        return;
      }
    }

    // 3. Fallback mock dev login if Client IDs are not yet registered
    setLoading(true);
    try {
      if (oauthLogin) {
        await oauthLogin(provider, {
          email: `${provider}_user@institutional.quant`,
          username: `${provider}_quant`,
          name: `${provider.toUpperCase()} Researcher`,
        });
      } else {
        const res = await apiClient.oauthLogin(provider, {
          email: `${provider}_user@institutional.quant`,
          username: `${provider}_quant`,
          name: `${provider.toUpperCase()} Researcher`,
        });
        if (res.access_token) {
          localStorage.setItem('alpha_jwt_token', res.access_token);
          apiClient.setToken(res.access_token);
        }
      }
      navigate('/overview');
    } catch (err) {
      setErrorMsg(err.message || `${provider} OAuth rejected`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterAsGuest = () => {
    setGuestMode();
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-[#101310] flex items-center justify-center p-4 font-mono select-none">
      <div className="term-panel w-full max-w-md shadow-2xl border border-[#343B33]">
        {/* Terminal Header */}
        <div className="term-header">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>ALPHAQUANT // AUTH GATEWAY</span>
          </div>
          <span className="term-badge-accent">TLS 1.3 SECURE</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Header Message */}
          <div>
            <div className="font-heading font-bold text-lg text-[#E9E8DF]">
              {authMode === 'login' && 'Researcher Authentication'}
              {authMode === 'register' && 'Institutional Account Registration'}
              {authMode === 'forgot_request' && 'Dispatch Password Recovery OTP'}
              {authMode === 'forgot_reset' && 'Authorize OTP & Reset Password'}
            </div>
            <div className="text-xs text-[#969B91] mt-0.5">
              Access deep learning price forecasts & quantitative risk engines.
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-2.5 bg-[#E47770]/15 border border-[#E47770] text-[#E47770] text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-[#77C98B]/15 border border-[#77C98B] text-[#77C98B] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {devOtpHint && (
            <div className="p-2 bg-[#C7F36B]/10 border border-[#C7F36B] text-[#C7F36B] text-[11px]">
              DEV OTP HINT: <strong>{devOtpHint}</strong> (Enter in OTP field below)
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Username */}
            {(authMode === 'login' || authMode === 'register') && (
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="term-input"
                  required
                />
              </div>
            )}

            {/* Email */}
            {(authMode === 'register' || authMode === 'forgot_request' || authMode === 'forgot_reset') && (
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="term-input"
                  required
                />
              </div>
            )}

            {/* OTP Code */}
            {authMode === 'forgot_reset' && (
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">6-DIGIT VERIFICATION OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="term-input text-center tracking-widest text-sm font-bold"
                  required
                />
              </div>
            )}

            {/* Password */}
            {authMode !== 'forgot_request' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#969B91]">
                    {authMode === 'forgot_reset' ? 'NEW SECURE PASSWORD' : 'PASSWORD'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot_request')}
                      className="text-[10px] text-[#C7F36B] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="term-input pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-[#969B91] hover:text-[#E9E8DF]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            {(authMode === 'register' || authMode === 'forgot_reset') && (
              <div>
                <label className="text-[10px] text-[#969B91] block mb-1">CONFIRM PASSWORD</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="term-input"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="term-btn-primary w-full py-2.5 font-bold flex items-center justify-center gap-1.5 mt-2"
            >
              {loading ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {authMode === 'login' && 'AUTHENTICATE & ENTER'}
                    {authMode === 'register' && 'CREATE RESEARCH ACCOUNT'}
                    {authMode === 'forgot_request' && 'SEND 6-DIGIT OTP'}
                    {authMode === 'forgot_reset' && 'CONFIRM PASSWORD RESET'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social OAuth & Guest Exploration */}
          {authMode === 'login' && (
            <div className="space-y-3 pt-2 border-t border-[#242B24]">
              <div className="text-[10px] text-[#969B91] text-center">OR AUTHENTICATE VIA SSO</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="term-btn-secondary py-2 flex items-center justify-center gap-2 text-xs"
                >
                  <GoogleIcon />
                  <span>Google SSO</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  className="term-btn-secondary py-2 flex items-center justify-center gap-2 text-xs"
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleEnterAsGuest}
                className="w-full text-center py-2 text-xs text-[#C7F36B] hover:underline"
              >
                Proceed as Guest Quant Researcher (Instant Sandbox) →
              </button>
            </div>
          )}

          {/* Mode Switchers */}
          <div className="text-center text-xs text-[#969B91] border-t border-[#242B24] pt-3">
            {authMode === 'login' ? (
              <div>
                Don't have an institutional profile?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-[#C7F36B] font-semibold hover:underline"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <div>
                Existing user?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-[#C7F36B] font-semibold hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
