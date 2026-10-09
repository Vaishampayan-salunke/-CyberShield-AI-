import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame, CheckCircle2 } from 'lucide-react';

export default function ThreatScoreRadar({ score = 0, level = 'Safe', confidence = 95 }) {
  // Determine color theme based on level or score
  let color = '#10B981'; // emerald/safe
  let textGradient = 'from-emerald-400 to-teal-300';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = CheckCircle2;

  if (score >= 80 || level === 'Critical') {
    color = '#EF4444'; // red
    textGradient = 'from-red-500 to-orange-400';
    badgeBg = 'bg-red-500/15 text-red-400 border-red-500/30';
    Icon = Flame;
  } else if (score >= 60 || level === 'High Risk') {
    color = '#F97316'; // orange
    textGradient = 'from-orange-500 to-amber-400';
    badgeBg = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    Icon = ShieldAlert;
  } else if (score >= 35 || level === 'Medium Risk') {
    color = '#F59E0B'; // amber/yellow
    textGradient = 'from-amber-400 to-yellow-300';
    badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
  } else if (score >= 15 || level === 'Low Risk') {
    color = '#3B82F6'; // blue
    textGradient = 'from-blue-400 to-cyan-300';
    badgeBg = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    Icon = ShieldCheck;
  }

  // Calculate circumference for progress circle
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-cyber-850/80 border border-slate-800/80 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
      />

      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Background Radar Grid */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="68"
            className="stroke-slate-800/80"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated score arc */}
          <motion.circle
            cx="88"
            cy="88"
            r="68"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score & radar sweep */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <span className={`text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br ${textGradient}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400 font-medium block">/ 100</span>
          </motion.div>
        </div>
      </div>

      {/* Severity Badge */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-col items-center gap-2"
      >
        <div className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{level}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>AI Confidence:</span>
          <span className="font-semibold text-slate-200">{confidence}%</span>
        </div>
      </motion.div>
    </div>
  );
}
