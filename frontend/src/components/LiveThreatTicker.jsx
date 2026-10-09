import React, { useState, useEffect } from 'react';
import { Shield, Radio, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

const INITIAL_FEEDS = [
  { id: 1, type: 'URL', target: 'secure-login-chase-update.xyz', verdict: 'BLOCKED', severity: 'Critical', time: 'Just now' },
  { id: 2, type: 'SMS', target: 'UPI Cashback Trap (+91 98210...)', verdict: 'INTERCEPTED', severity: 'High', time: '12s ago' },
  { id: 3, type: 'EMAIL', target: 'Invoice_Wire_Transfer.eml', verdict: 'QUARANTINED', severity: 'Critical', time: '45s ago' },
  { id: 4, type: 'QR', target: 'Dynamic UPI Debit QR Payload', verdict: 'FLAGGED', severity: 'Critical', time: '1m ago' },
  { id: 5, type: 'URL', target: 'https://docs.github.com/en/rest', verdict: 'VERIFIED SAFE', severity: 'Safe', time: '2m ago' },
];

export default function LiveThreatTicker() {
  const [feeds, setFeeds] = useState(INITIAL_FEEDS);

  useEffect(() => {
    const targets = [
      { type: 'EMAIL', target: 'DocuSign_Secure_Sign.html.eml', verdict: 'BLOCKED', severity: 'High' },
      { type: 'SMS', target: 'Electricity Disconnection Notice', verdict: 'INTERCEPTED', severity: 'Critical' },
      { type: 'URL', target: 'http://192.168.1.104/bank/auth', verdict: 'BLOCKED', severity: 'Critical' },
      { type: 'QR', target: 'Fastag Recharge Scam QR', verdict: 'BLOCKED', severity: 'High' },
      { type: 'EMAIL', target: 'Internal Security Policy Memo', verdict: 'VERIFIED SAFE', severity: 'Safe' },
    ];

    const interval = setInterval(() => {
      const random = targets[Math.floor(Math.random() * targets.length)];
      setFeeds((prev) => [
        { ...random, id: Date.now(), time: 'Just now' },
        ...prev.slice(0, 5),
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-cyber-900/90 border-y border-slate-800/80 px-4 py-2 text-xs flex items-center gap-4 overflow-hidden backdrop-blur-md">
      <div className="flex items-center gap-2 shrink-0 font-bold uppercase tracking-wider text-blue-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span>SOC Threat Feed:</span>
      </div>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1 text-slate-300">
        {feeds.map((item) => (
          <div key={item.id} className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
              {item.type}
            </span>
            <span className="font-mono text-slate-200">{item.target}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.severity === 'Critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : item.severity === 'High'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {item.verdict}
            </span>
            <span className="text-[10px] text-slate-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
