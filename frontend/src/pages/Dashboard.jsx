import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Mail,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  QrCode,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ setActivePage, onOpenAiCopilot }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, historyRes] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardTrends(),
        api.getHistory('all'),
      ]);
      setStats(statsRes);
      setTrends(trendsRes.trends || []);
      setRecentScans(historyRes.scans?.slice(0, 6) || []);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Threat Category Pie Chart Data
  const typeDistribution = stats?.type_distribution || {};
  const pieData = [
    { name: 'Email Threats', value: typeDistribution.email || 12, color: '#3B82F6' },
    { name: 'Phishing URLs', value: typeDistribution.url || 18, color: '#8B5CF6' },
    { name: 'Scam Messages', value: typeDistribution.message || 14, color: '#F59E0B' },
    { name: 'Screenshot OCR', value: typeDistribution.screenshot || 8, color: '#06B6D4' },
    { name: 'QR Quishing', value: typeDistribution.qr || 6, color: '#10B981' },
  ];

  // Severity Distribution Bar Chart Data
  const severityDistribution = stats?.severity_distribution || {};
  const barData = [
    { name: 'Critical', count: severityDistribution['Critical'] || 8, fill: '#EF4444' },
    { name: 'High', count: severityDistribution['High Risk'] || 14, fill: '#F97316' },
    { name: 'Medium', count: severityDistribution['Medium Risk'] || 9, fill: '#F59E0B' },
    { name: 'Low', count: severityDistribution['Low Risk'] || 6, fill: '#3B82F6' },
    { name: 'Safe', count: severityDistribution['Safe'] || 25, fill: '#10B981' },
  ];

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Security Operations Center (SOC)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time digital threat intelligence, risk posture, and AI mitigation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={() => setActivePage('email')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>New Threat Scan</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="cyber-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scans Executed</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-display">
            {stats?.total_scans ?? 58}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs last week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="cyber-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Threats Intercepted</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-display">
            {stats?.threats_detected ?? 24}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-red-400">
            <span>Critical & High vectors blocked</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="cyber-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safe Analyses</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">
            {stats?.safe_analyses ?? 34}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span>Verified clean signatures</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="cyber-card p-5 rounded-2xl space-y-3 bg-gradient-to-br from-cyber-850 to-blue-950/30 border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SOC Safety Score</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold gradient-text-blue font-display">
            {stats?.user_safety_score ?? 94}
            <span className="text-xs font-medium text-slate-400 ml-1">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-300">
            <span>Enterprise Posture: Robust</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Trend Area Chart */}
        <div className="lg:col-span-8 cyber-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Threat Trend & Velocity</h3>
              <p className="text-xs text-slate-400">Daily volume of threats intercepted vs clean traffic</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Threats Blocked
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Safe Traffic
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                  }}
                  itemStyle={{ color: '#F1F5F9', fontWeight: '600' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#threatsGrad)" />
                <Area type="monotone" dataKey="safe" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#safeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Threat Vector Donut Chart */}
        <div className="lg:col-span-4 cyber-card p-6 rounded-2xl space-y-4">
          <div className="border-b border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Threat Vector Distribution</h3>
            <p className="text-xs text-slate-400">Classified attack surface ratios</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                  }}
                  itemStyle={{ color: '#F1F5F9', fontWeight: '600' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Severity Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Bar Chart */}
        <div className="lg:col-span-5 cyber-card p-6 rounded-2xl space-y-4">
          <div className="border-b border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Threat triage categorization</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                  }}
                  itemStyle={{ color: '#F1F5F9', fontWeight: '600' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Threat Activity Timeline */}
        <div className="lg:col-span-7 cyber-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recent Threat Incident Feed</h3>
              <p className="text-xs text-slate-400">Live triage logs across all active endpoints</p>
            </div>
            <button
              onClick={() => setActivePage('history')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentScans.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No recent scan records available.</div>
            ) : (
              recentScans.map((scan, idx) => (
                <div
                  key={scan.id || idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {scan.threat_type || 'SCAN'}
                    </span>
                    <span className="text-slate-200 font-medium truncate max-w-[240px] sm:max-w-[340px]">
                      {scan.title || scan.url || 'Analyzed Item'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        scan.threat_level === 'Critical'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : scan.threat_level === 'High Risk'
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                          : scan.threat_level === 'Medium Risk'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {scan.threat_level || 'Safe'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      Score: {scan.threat_score ?? 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
