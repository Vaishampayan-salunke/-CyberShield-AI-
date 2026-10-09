import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Layers,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import ThreatScoreRadar from '../components/ThreatScoreRadar';
import IndicatorsList from '../components/IndicatorsList';
import AIExplanationCard from '../components/AIExplanationCard';
import ThreatAlertBanner from '../components/ThreatAlertBanner';

export default function UrlScanner({ setActivePage }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const passedUrl = sessionStorage.getItem('scan_url_target');
    if (passedUrl) {
      setUrl(passedUrl);
      sessionStorage.removeItem('scan_url_target');
    }
  }, []);

  const sampleUrls = [
    {
      name: '🚨 Chase Bank Typosquatting',
      url: 'http://secure-chase-update-login.xyz/auth/verify?session=expired',
    },
    {
      name: '⚠️ Shortened Obfuscated Link',
      url: 'https://bit.ly/3xX9Q1a-urgent-tax-refund',
    },
    {
      name: '🍎 Apple ID Credential Harvester',
      url: 'http://appleid.apple-support-auth.top/signin/index.php',
    },
    {
      name: '🏦 SBI Banking KYC Trap',
      url: 'http://sbi-yono-kyc-update.online/netbanking',
    },
    {
      name: '✅ Legitimate Wikipedia Page',
      url: 'https://en.wikipedia.org/wiki/Computer_security',
    },
  ];

  const handleSelectSample = (sample) => {
    setUrl(sample.url);
    setScanResult(null);
  };

  const handleScan = async () => {
    const urlToScan = url.trim();
    if (!urlToScan || loading) return;

    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.scanUrl(urlToScan);
      setScanResult(res);
    } catch (e) {
      console.error('URL scan error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              URL & Fake Website Scanner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Lexical feature decomposition, typosquatting brand heuristics, entropy calculations, and Random Forest classification.
          </p>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">Preload benchmark URL threat vectors:</div>
        <div className="flex flex-wrap gap-2">
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-slate-750 hover:border-purple-500/40 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="cyber-card p-6 sm:p-8 rounded-2xl space-y-4">
        <label className="text-xs font-semibold text-slate-300 block">Target URL or Domain Name</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://secure-login-chase-update.xyz/auth or https://paypal.com"
              className="w-full bg-cyber-950 border border-slate-750 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <button
            onClick={() => handleScan()}
            disabled={loading || !url.trim()}
            className="py-3 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deconstructing URL Signatures...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Deep Scan URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ThreatAlertBanner
              threatLevel={scanResult.threat_level}
              threatScore={scanResult.threat_score}
              threatType="URL"
            />

            {/* Domain Analysis Metrics Bar */}
            {scanResult.domain_analysis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">SSL Encryption:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-1 ${
                      scanResult.domain_analysis.has_ssl
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {scanResult.domain_analysis.has_ssl ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {scanResult.domain_analysis.protocol}
                  </span>
                </div>

                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Subdomains:</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {scanResult.domain_analysis.subdomain_count} Levels
                  </span>
                </div>

                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">URL Entropy:</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {scanResult.domain_analysis.entropy} bits
                  </span>
                </div>

                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Reputation:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      scanResult.threat_score >= 60
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : scanResult.threat_score >= 35
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {scanResult.domain_analysis.estimated_reputation}
                  </span>
                </div>
              </div>
            )}

            {/* Radar & Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 flex justify-center">
                <ThreatScoreRadar
                  score={scanResult.threat_score}
                  level={scanResult.threat_level}
                  confidence={scanResult.confidence_score}
                />
              </div>

              <div className="lg:col-span-7 cyber-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Domain & URL Threat Factors ({scanResult.detected_indicators?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">Random Forest Classifier</span>
                </div>
                <IndicatorsList indicators={scanResult.detected_indicators} />
              </div>
            </div>

            {/* AI Explanation */}
            <AIExplanationCard
              explanation={scanResult.ai_explanation}
              potentialImpact={scanResult.potential_impact}
              recommendedActions={scanResult.recommended_actions}
              threatLevel={scanResult.threat_level}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
