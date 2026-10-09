import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  QrCode,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ExternalLink,
  CreditCard,
  Flame,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { api } from '../services/api';
import ThreatScoreRadar from '../components/ThreatScoreRadar';
import IndicatorsList from '../components/IndicatorsList';
import AIExplanationCard from '../components/AIExplanationCard';
import ThreatAlertBanner from '../components/ThreatAlertBanner';

export default function QrScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const sampleQRs = [
    {
      name: '🚨 UPI Money Debit Trap QR',
      url: 'upi://pay?pa=scammer-merchant@icici&pn=Refund%20Officer&am=5000&cu=INR&tn=UPI%20Cashback%20Reward',
      desc: 'Siphons ₹5,000 via unauthorized UPI debit call',
    },
    {
      name: '⚠️ Quishing Phishing URL QR',
      url: 'https://secure-login-verify.sbi-portal.xyz/kyc/update?ref=qr_auth',
      desc: 'Credential harvesting fake banking login page',
    },
    {
      name: '✅ Legitimate Secure Portal QR',
      url: 'https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx',
      desc: 'Official Indian National Cyber Crime Portal',
    },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFallbackUrl('');
    setScanResult(null);
  };

  const handleSelectSample = async (sample) => {
    setSelectedFile(null);
    setFallbackUrl(sample.url);
    setScanResult(null);

    try {
      const dataUrl = await QRCode.toDataURL(sample.url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate local QR preview:', err);
    }
  };

  const handleScan = async () => {
    if (!selectedFile && !fallbackUrl) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.scanQr(selectedFile, fallbackUrl);
      setScanResult(res);
    } catch (e) {
      console.error('QR scan error:', e);
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
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              QR Code Security & Quishing Scanner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Decodes embedded QR payloads before your device executes them. Prevents unauthorized UPI money transfers and credential theft.
          </p>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">Preload benchmark QR threat payloads:</div>
        <div className="flex flex-wrap gap-2">
          {sampleQRs.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-750 hover:border-emerald-500/40 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Box & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Box */}
        <div className="lg:col-span-6 cyber-card p-6 sm:p-8 rounded-2xl space-y-4">
          <label className="text-xs font-semibold text-slate-300 block">Upload QR Code Image</label>
          <div
            onClick={() => document.getElementById('qr-file').click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-cyber-950/50 flex flex-col items-center justify-center min-h-[200px]"
          >
            <input
              id="qr-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-emerald-400 mb-3" />
            <div className="text-sm font-semibold text-slate-200">
              {selectedFile ? selectedFile.name : 'Click to upload QR code image or drag & drop'}
            </div>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP QR code images</p>
          </div>

          <button
            onClick={handleScan}
            disabled={loading || (!selectedFile && !fallbackUrl)}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-glow-emerald flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Decoding QR Matrix & Inspecting Payload...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Decode & Inspect QR Security</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code Matrix Display */}
        <div className="lg:col-span-6 cyber-card p-6 sm:p-8 rounded-2xl space-y-4 flex flex-col items-center justify-center">
          <div className="w-full border-b border-slate-800/80 pb-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">QR Code Preview</span>
            {previewUrl && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                READY
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            {previewUrl ? (
              <div className="relative p-4 rounded-2xl bg-white/5 border border-slate-700">
                <img src={previewUrl} alt="QR Preview" className="w-40 h-40 rounded-lg object-contain bg-white p-2" />
                {loading && (
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="w-full h-1 bg-emerald-400 shadow-glow-emerald animate-bounce mt-10" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-10">
                <QrCode className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                <span>Upload a QR code or pick a test benchmark to inspect.</span>
              </div>
            )}
          </div>
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
              threatType="QR Code"
            />

            {/* Decoded Content Banner */}
            <div className="cyber-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  Decoded QR Payload Content:
                </span>
                {scanResult.is_upi && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    UPI PAYMENT DEBIT
                  </span>
                )}
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-emerald-300 break-all select-all">
                {scanResult.decoded_content || scanResult.url}
              </div>
            </div>

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
                    QR Threat Indicators ({scanResult.detected_indicators?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">QR Quishing Engine</span>
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
