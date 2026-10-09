import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  PhoneCall,
  Link2,
  Tag,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import ThreatScoreRadar from '../components/ThreatScoreRadar';
import IndicatorsList from '../components/IndicatorsList';
import AIExplanationCard from '../components/AIExplanationCard';
import ThreatAlertBanner from '../components/ThreatAlertBanner';

export default function MessageAnalyzer() {
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const sampleScams = [
    {
      name: '⚡ Electricity Disconnection Notice',
      text: 'Dear customer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210 to avoid disconnection.',
    },
    {
      name: '🏦 SBI KYC Bank Account Block',
      text: 'Your SBI Bank account has been blocked due to pending KYC update. Click http://sbi-kyc-update.online to avoid permanent deactivation within 12 hours.',
    },
    {
      name: '💼 YouTube Like Video Work-From-Home',
      text: 'Part-time job offer! Earn ₹3,000 to ₹5,000 daily from home by simply liking YouTube videos. No experience required. Join Telegram channel: t.me/fast_daily_earn',
    },
    {
      name: '📦 FedEx Customs Contraband Extortion',
      text: 'FedEx Alert: Your courier parcel contains illegal contraband and has been seized by customs. Call Mumbai Police Cyber Cell immediately at +91-9812345678 to avoid arrest warrant.',
    },
    {
      name: '🎉 KBC ₹25 Lakh Lottery Prize',
      text: 'Congratulations! Your mobile number won ₹25,00,000 lottery in Kaun Banega Crorepati lucky draw. Contact WhatsApp manager at +91-8888888888 with token #KBC9921.',
    },
    {
      name: '✅ Safe Personal WhatsApp Chat',
      text: 'Hey! Are we still meeting for dinner at 7:30 PM today? Let me know so I can reserve a table.',
    },
  ];

  const handleSelectSample = (sample) => {
    setMessageText(sample.text);
    setScanResult(null);
  };

  const handleScan = async () => {
    const textToScan = messageText.trim();
    if (!textToScan || loading) return;

    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.scanMessage(textToScan);
      setScanResult(res);
    } catch (e) {
      console.error('Message scan error:', e);
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
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              SMS & WhatsApp Scam Classifier
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detects extortion, fake UPI cashback, banking suspension lures, and coercive task scams using TF-IDF and Random Forest.
          </p>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">Preload benchmark scam scenarios:</div>
        <div className="flex flex-wrap gap-2">
          {sampleScams.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-amber-600/20 text-slate-300 hover:text-amber-300 border border-slate-750 hover:border-amber-500/40 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="cyber-card p-6 sm:p-8 rounded-2xl space-y-4">
        <label className="text-xs font-semibold text-slate-300 block">Suspicious Message Text</label>
        <textarea
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Paste SMS text, WhatsApp forward, Telegram message, or social media DM..."
          className="w-full bg-cyber-950 border border-slate-750 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
        />

        <button
          onClick={() => handleScan()}
          disabled={loading || !messageText.trim()}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-glow-danger flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Scam Vectors & Urgency Triggers...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Classify Scam Message</span>
            </>
          )}
        </button>
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
              threatType="Message"
            />

            {/* Matched Scam Categories */}
            {scanResult.matched_scam_types && scanResult.matched_scam_types.length > 0 && (
              <div className="cyber-card p-4 rounded-xl flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Matched Scam Taxonomies:
                </span>
                {scanResult.matched_scam_types.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  >
                    {cat}
                  </span>
                ))}
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
                    Identified Social Engineering Indicators ({scanResult.detected_indicators?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">NLP Classifier</span>
                </div>
                <IndicatorsList indicators={scanResult.detected_indicators} />
              </div>
            </div>

            {/* AI Explanation & Response */}
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
