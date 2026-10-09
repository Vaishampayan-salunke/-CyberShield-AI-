import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  UploadCloud,
  FileImage,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import ThreatScoreRadar from '../components/ThreatScoreRadar';
import IndicatorsList from '../components/IndicatorsList';
import AIExplanationCard from '../components/AIExplanationCard';
import ThreatAlertBanner from '../components/ThreatAlertBanner';

export default function ScreenshotAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [clientText, setClientText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState(null);

  const sampleScreenshots = [
    {
      name: '📱 WhatsApp Electricity Extortion Screenshot',
      text: 'Dear customer, your electricity power will be disconnected tonight at 9:30 PM from the power office. Please contact our electricity officer Mr. Sharma at 9876543210 immediately.',
    },
    {
      name: '💳 Fake SBI NetBanking KYC Alert Screenshot',
      text: 'STATE BANK ALERT: Dear customer, your YONO account is blocked today due to pending PAN/Aadhaar verification. Login to http://sbi-kyc-verify.online to update.',
    },
    {
      name: '💰 UPI Cashback ₹3,000 Reward Screenshot',
      text: 'PhonePe Reward: You won ₹3,000 cashback! Scan the QR code below and enter your UPI PIN to claim money in your bank account.',
    },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setClientText('');
    setScanResult(null);
  };

  const handleSelectSample = (sample) => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setClientText(sample.text);
    setScanResult(null);
  };

  const handleScan = async () => {
    if (!selectedFile && !clientText) return;
    setLoading(true);
    setScanResult(null);
    setScanStep(1); // OCR Extraction
    setTimeout(() => setScanStep(2), 600); // Threat Classification
    setTimeout(() => setScanStep(3), 1200); // AI Synthesis

    try {
      let fileToSend = selectedFile;
      if (!fileToSend) {
        // Create dummy blob for sample test
        fileToSend = new File(['sample_screenshot_binary'], 'sample_scam_chat.png', { type: 'image/png' });
      }

      const res = await api.scanScreenshot(fileToSend, clientText);
      setTimeout(() => {
        setScanResult(res);
        setLoading(false);
        setScanStep(0);
      }, 1500);
    } catch (e) {
      console.error('Screenshot scan error:', e);
      setLoading(false);
      setScanStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              Screenshot OCR Scam Analyzer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Optical character extraction and computer vision analysis for screenshot-based fraud, WhatsApp chats, and fake receipts.
          </p>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">Preload benchmark screenshot scenarios:</div>
        <div className="flex flex-wrap gap-2">
          {sampleScreenshots.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 border border-slate-750 hover:border-cyan-500/40 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Box & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-6 cyber-card p-6 sm:p-8 rounded-2xl space-y-4">
          <label className="text-xs font-semibold text-slate-300 block">Upload Screenshot Image</label>
          <div
            onClick={() => document.getElementById('screenshot-file').click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-cyber-950/50 flex flex-col items-center justify-center min-h-[200px]"
          >
            <input
              id="screenshot-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-cyan-400 mb-3" />
            <div className="text-sm font-semibold text-slate-200">
              {selectedFile ? selectedFile.name : 'Click to upload screenshot or drag & drop'}
            </div>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP images of chats, messages, or emails</p>
          </div>

          <button
            onClick={handleScan}
            disabled={loading || (!selectedFile && !clientText)}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {scanStep === 1 && 'Extracting Optical Text via OCR...'}
                  {scanStep === 2 && 'Executing NLP Threat Classifier...'}
                  {scanStep === 3 && 'Synthesizing Gemini AI Insights...'}
                  {scanStep === 0 && 'Analyzing Screenshot...'}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Extract & Analyze Screenshot</span>
              </>
            )}
          </button>
        </div>

        {/* Preview & OCR Text Column */}
        <div className="lg:col-span-6 cyber-card p-6 sm:p-8 rounded-2xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-semibold text-slate-300">Screenshot Preview & Extracted OCR Text</span>
            {scanResult?.ocr_engine && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {scanResult.ocr_engine}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative max-h-48 rounded-xl overflow-hidden border border-slate-800 flex justify-center bg-black">
                  <img src={previewUrl} alt="Preview" className="object-contain max-h-48" />
                </div>
                {(clientText || scanResult?.extracted_text) && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed max-h-36 overflow-y-auto">
                    <span className="text-slate-500 block mb-1 font-sans text-[10px] uppercase font-bold">Extracted Text:</span>
                    {scanResult?.extracted_text || clientText}
                  </div>
                )}
              </div>
            ) : clientText ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 font-semibold border-b border-slate-800 pb-1.5">
                    <span>📱 Mockup Screenshot Selected</span>
                    <span className="text-slate-500">Ready for OCR & NLP</span>
                  </div>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    "{clientText}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-10">
                <FileImage className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <span>Upload a screenshot or click a preset benchmark to preview OCR extraction.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Display */}
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
              threatType="Screenshot"
            />

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
                    Extracted Threat Signatures ({scanResult.detected_indicators?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">OCR + Threat Classifier</span>
                </div>
                <IndicatorsList indicators={scanResult.detected_indicators} />
              </div>
            </div>

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
