import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function IndicatorsList({ indicators = [] }) {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">No Malicious Indicators Detected</p>
        <p className="text-xs text-slate-500 mt-1">Content conforms to legitimate security standards.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          icon: AlertCircle,
          label: 'CRITICAL',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          icon: AlertTriangle,
          label: 'HIGH',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
          label: 'MEDIUM',
        };
      default:
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: Info,
          label: 'INFO',
        };
    }
  };

  return (
    <div className="space-y-2.5">
      {indicators.map((ind, idx) => {
        const badge = getSeverityBadge(ind.severity);
        const Icon = badge.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex items-start gap-3"
          >
            <div className={`p-1.5 rounded-lg border shrink-0 ${badge.bg}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-semibold text-slate-200 tracking-wide">
                  {ind.type || 'Threat Pattern'}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {ind.detail || ind.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
