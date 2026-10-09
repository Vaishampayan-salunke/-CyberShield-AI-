import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Volume2, VolumeX, ShieldAlert, X, BellRing } from 'lucide-react';
import { soundAlert } from '../utils/soundAlert';

export default function ThreatAlertBanner({ threatLevel, threatScore, threatType = 'Threat' }) {
  const [soundOn, setSoundOn] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const isHighRisk = threatLevel === 'Critical' || threatLevel === 'High Risk';

  useEffect(() => {
    if (isHighRisk) {
      setDismissed(false);
      soundAlert.playCyberAlert(threatLevel);
    }
  }, [threatLevel, threatScore]);

  const handleToggleSound = () => {
    const nextState = soundAlert.toggleSound();
    setSoundOn(nextState);
  };

  if (!isHighRisk || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-2xl backdrop-blur-xl ${
        threatLevel === 'Critical'
          ? 'bg-gradient-to-r from-red-950/80 via-red-900/40 to-slate-900 border-red-500/50 shadow-glow-danger'
          : 'bg-gradient-to-r from-orange-950/80 via-orange-900/40 to-slate-900 border-orange-500/50 shadow-orange-500/20'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`p-2.5 rounded-xl text-white animate-pulse ${
            threatLevel === 'Critical' ? 'bg-red-600 shadow-glow-danger' : 'bg-orange-600'
          }`}
        >
          <BellRing className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                threatLevel === 'Critical' ? 'bg-red-500/30 text-red-300' : 'bg-orange-500/30 text-orange-300'
              }`}
            >
              ACTIVE {threatLevel.toUpperCase()} DETECTED
            </span>
            <span className="text-[11px] font-mono text-slate-400">Score: {threatScore}/100</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-1">
            Immediate Containment Advisory: Do not interact with links, attachments, or provide sensitive authentication credentials.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title={soundOn ? 'Mute Alert Sound' : 'Enable Alert Sound'}
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
