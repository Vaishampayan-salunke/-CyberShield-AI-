import React from 'react';
import { Shield, Lock, ShieldCheck, Heart, Terminal, Cpu } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-cyber-950 border-t border-slate-850 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span>CyberShield AI V2</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Autonomous AI-driven cyber threat intelligence and digital safety platform for modern enterprises and digital citizens.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> End-to-End Encrypted</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> ML Inference</span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">Threat Scanners</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActivePage('email')} className="hover:text-blue-400 transition-colors">Email Threat Analyzer</button></li>
              <li><button onClick={() => setActivePage('url')} className="hover:text-blue-400 transition-colors">URL & Website Scanner</button></li>
              <li><button onClick={() => setActivePage('message')} className="hover:text-blue-400 transition-colors">Scam Message Classifier</button></li>
              <li><button onClick={() => setActivePage('screenshot')} className="hover:text-blue-400 transition-colors">Screenshot OCR Analyzer</button></li>
              <li><button onClick={() => setActivePage('qr')} className="hover:text-blue-400 transition-colors">QR Security Scanner</button></li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActivePage('dashboard')} className="hover:text-blue-400 transition-colors">SOC Dashboard</button></li>
              <li><button onClick={() => setActivePage('learning')} className="hover:text-blue-400 transition-colors">Cyber Learning Academy</button></li>
              <li><button onClick={() => setActivePage('history')} className="hover:text-blue-400 transition-colors">Threat History Audit</button></li>
              <li><button onClick={() => setActivePage('ai-assistant')} className="hover:text-blue-400 transition-colors">Gemini AI Security Copilot</button></li>
            </ul>
          </div>

          {/* Security Certifications */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Compliance & Architecture</h4>
            <div className="p-3.5 rounded-xl bg-cyber-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Architecture</span>
                <span className="text-blue-400 font-mono font-bold">FastAPI + React</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">ML Pipeline</span>
                <span className="text-purple-400 font-mono font-bold">TF-IDF + Random Forest</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">AI Reasoning</span>
                <span className="text-emerald-400 font-mono font-bold">Gemini API</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-850 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 CyberShield AI Platform. All rights reserved. Hackathon Production Build.</div>
          <div className="flex items-center gap-4">
            <span>Built for AI-Powered Cybersecurity & Digital Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
