import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [needsRegister, setNeedsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsRegister(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanEmail, password);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.message || 'Login failed. Please verify your credentials.');
        if (res.message?.toLowerCase().includes('create an account') || res.message?.toLowerCase().includes('no account')) {
          setNeedsRegister(true);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    guestLogin('Alex Carter');
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Dynamic background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-pink-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top back navigation */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30">
            <img
              src="/assets/3d_dj_logo.jpg"
              alt="WatchParty Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-xs font-bold tracking-tight font-heading text-white">
            Watch<span className="text-purple-400">Party</span>
          </span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0F1222]/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Zero Latency • Stream In Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Sign In to WatchParty
          </h1>
          <p className="text-xs text-zinc-400">
            {redirectPath === '/create'
              ? 'Please log in with your registered account to host a synchronized room.'
              : 'Access your saved songs locker, sync parties, and host rooms.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {needsRegister && (
              <div className="pt-1">
                <Link
                  to={`/register?redirect=${encodeURIComponent(redirectPath)}&email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create New Account Now</span>
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
              setNeedsRegister(false);
            }}
            icon={<Mail className="w-4 h-4 text-zinc-400" />}
            autoFocus
            required
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#151932] border border-slate-700/80 rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500/30"
              />
              <span>Remember me</span>
            </label>
            <span className="text-purple-400 hover:text-purple-300 text-xs cursor-pointer">
              Forgot password?
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 mt-2"
          >
            Sign In to Room
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3 text-center">
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={handleDemoLogin}
            className="w-full text-xs text-purple-300 border-purple-500/20 hover:bg-purple-600/10 flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            <span>1-Click Demo Host Login (Alex Carter)</span>
          </Button>

          <p className="text-xs text-zinc-400">
            Don't have an account yet?{' '}
            <Link
              to={`/register${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
              className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
