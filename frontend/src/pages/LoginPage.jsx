import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, User, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setActivePage }) {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    try {
      await loginAsDemo();
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md cyber-card p-8 rounded-3xl border border-slate-750 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 w-fit mx-auto shadow-glow-blue">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-display">Sign In to CyberShield AI</h2>
          <p className="text-xs text-slate-400">Access enterprise SOC threat intelligence and telemetry</p>
        </div>

        {/* Demo Fast Login for Judges */}
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Judge Quick Access:</span>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>1-Click Demo SOC Analyst Sign In</span>}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-cyber-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Or with Email</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@cybershield.ai"
                className="w-full bg-cyber-950 border border-slate-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cyber-950 border border-slate-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => setActivePage('signup')}
            className="font-semibold text-blue-400 hover:underline"
          >
            Create an Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
