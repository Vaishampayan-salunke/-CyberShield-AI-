import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  UploadCloud,
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Link2,
  FileCode,
  Loader2,
  Lock,
  ExternalLink,
  Paperclip,
  Calendar,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import ThreatScoreRadar from '../components/ThreatScoreRadar';
import IndicatorsList from '../components/IndicatorsList';
import AIExplanationCard from '../components/AIExplanationCard';
import ThreatAlertBanner from '../components/ThreatAlertBanner';

export default function EmailAnalyzer({ setActivePage }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [emailText, setEmailText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const sampleEmails = [
    {
      name: '🚨 PayPal Credential Phishing',
      subject: 'Urgent: Your account access has been limited',
      sender: 'security-service@paypa1-support.com',
      body: `Dear Customer,

We detected unusual activity on your PayPal account. For your security, your account has been temporarily restricted.

You must confirm your identity and credit card details within 24 hours to restore full account privileges:
http://paypa1-security-verify.xyz/login/auth

Failure to verify will result in permanent account suspension.

Sincerely,
PayPal Security Department`,
    },
    {
      name: '💼 CEO BEC Wire Transfer Fraud',
      subject: 'CONFIDENTIAL: Urgent Wire Transfer Required Today',
      sender: 'ceo-office@company-corp.com',
      body: `Hi,

I am currently in an executive board meeting and unable to take calls. We have closed an urgent acquisition agreement that requires an immediate wire transfer of $48,500.

Please process this payment immediately to the account details attached below and send me the transfer confirmation receipt. Do not discuss this with the team until officially announced.

Best regards,
Chief Executive Officer`,
    },
    {
      name: '📄 DocuSign Agreement Invoice Spoof',
      subject: 'DocuSign: Please review and sign Invoice #9842',
      sender: 'docusign-notifications@service-docu-sign.top',
      body: `DocuSign Document Notification:

You have received an urgent document for electronic signature from Accounting Dept.
Document: Q3_Vendor_Invoice_9842.pdf

Click below to view and complete document signing:
https://docusign-auth-portal.top/view/doc?id=984218

Links expire in 2 hours.`,
    },
    {
      name: '✅ Safe Quarterly Engineering Review',
      subject: 'Quarterly Sprint Planning & Architecture Review',
      sender: 'alex.chen@techcorp.io',
      body: `Hi Team,

Attached is our proposed technical roadmap for the upcoming sprint. Please review the service latency optimizations and database sharding proposal before our planning session on Thursday at 10:00 AM.

Let me know if you have any questions or feedback.

Thanks,
Alex Chen | Engineering Lead`,
    },
  ];

  const handleSelectSample = (sample) => {
    setActiveTab('text');
    setEmailSubject(sample.subject);
    setEmailSender(sample.sender);
    setEmailText(sample.body);
    setScanResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const handleScan = async () => {
    if (activeTab === 'text') {
      if (!emailText.trim() || loading) return;
      setLoading(true);
      setScanResult(null);
      try {
        const res = await api.scanEmail({
          text: emailText,
          subject: emailSubject,
          sender: emailSender,
        });
        setScanResult(res);
      } catch (e) {
        console.error('Email scan error:', e);
      } finally {
        setLoading(false);
      }
    } else {
      if (!selectedFile || loading) return;
      setLoading(true);
      setScanResult(null);
      try {
        const res = await api.uploadEmailFile(selectedFile);
        setScanResult(res);
      } catch (e) {
        console.error('Email file scan error:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              Email Threat Intelligence Analyzer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep multi-layer inspection: NLP threat classification, SPF/DKIM verification, and link harvesting analysis.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-cyber-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'text' ? 'bg-blue-600 text-white shadow-glow-blue' : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Text / Snippet
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'file' ? 'bg-blue-600 text-white shadow-glow-blue' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload .EML / .MSG File
          </button>
        </div>
      </div>

      {/* Preset Sample Selectors */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">Preload benchmark threat scenarios:</div>
        <div className="flex flex-wrap gap-2">
          {sampleEmails.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-slate-750 hover:border-blue-500/40 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="cyber-card p-6 sm:p-8 rounded-2xl space-y-6">
        {activeTab === 'text' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Sender Email (From:)</label>
                <input
                  type="text"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  placeholder="e.g. security-update@paypal-support.com"
                  className="w-full bg-cyber-950 border border-slate-750 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Action Required: Account Access Limited"
                  className="w-full bg-cyber-950 border border-slate-750 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Email Body Content</label>
              <textarea
                rows={6}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste the full body of the email including any links, sender signatures, or instructions..."
                className="w-full bg-cyber-950 border border-slate-750 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onClick={() => document.getElementById('eml-upload-input').click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-cyber-950/50"
            >
              <input
                id="eml-upload-input"
                type="file"
                accept=".eml,.msg,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-200">
                {selectedFile ? (
                  <span className="text-blue-400 font-mono font-bold">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  'Click to upload or drag & drop standard .EML / .MSG email file'
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Parses RFC 822 headers, SPF/DKIM records, body text, and attachments</p>
            </div>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={loading || (activeTab === 'text' ? !emailText.trim() : !selectedFile)}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Email Signatures & Headers...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Execute Email Threat Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* High-Risk Audio & Visual Alert Banner */}
            <ThreatAlertBanner
              threatLevel={scanResult.threat_level}
              threatScore={scanResult.threat_score}
              threatType="Email"
            />

            {/* Parsed Headers View if EML */}
            {scanResult.parsed_headers && (
              <div className="cyber-card p-4 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">Parsed Email Headers</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                  <div><span className="text-slate-500 font-semibold">From:</span> {scanResult.parsed_headers.from || 'N/A'}</div>
                  <div><span className="text-slate-500 font-semibold">Subject:</span> {scanResult.parsed_headers.subject || 'N/A'}</div>
                  <div><span className="text-slate-500 font-semibold">To:</span> {scanResult.parsed_headers.to || 'N/A'}</div>
                  <div><span className="text-slate-500 font-semibold">Date:</span> {scanResult.parsed_headers.date || 'N/A'}</div>
                </div>
              </div>
            )}

            {/* Header Security Status Cards */}
            {scanResult.security_headers && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">SPF Record:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      scanResult.security_headers.spf === 'PASS'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : scanResult.security_headers.spf === 'FAIL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {scanResult.security_headers.spf}
                  </span>
                </div>

                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">DKIM Signature:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      scanResult.security_headers.dkim === 'PASS'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : scanResult.security_headers.dkim === 'FAIL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {scanResult.security_headers.dkim}
                  </span>
                </div>

                <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">DMARC Policy:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      scanResult.security_headers.dmarc === 'PASS'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : scanResult.security_headers.dmarc === 'FAIL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {scanResult.security_headers.dmarc}
                  </span>
                </div>
              </div>
            )}

            {/* Radar & Indicators Grid */}
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
                    Detected Threat Indicators ({scanResult.detected_indicators?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">Heuristic + ML Engine</span>
                </div>
                <IndicatorsList indicators={scanResult.detected_indicators} />
              </div>
            </div>

            {/* Attachments List if present */}
            {scanResult.attachments && scanResult.attachments.length > 0 && (
              <div className="cyber-card p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-amber-400" />
                  <span>Detected Attachments ({scanResult.attachments.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scanResult.attachments.map((att, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-750 text-slate-200">
                      {att}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Hyperlinks */}
            {scanResult.extracted_urls && scanResult.extracted_urls.length > 0 && (
              <div className="cyber-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  <span>Extracted Hyperlinks in Email ({scanResult.extracted_urls.length})</span>
                </div>
                <div className="space-y-2">
                  {scanResult.extracted_urls.map((u, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs gap-3"
                    >
                      <span className="font-mono text-slate-300 truncate">{u}</span>
                      <button
                        onClick={() => {
                          sessionStorage.setItem('scan_url_target', u);
                          setActivePage('url');
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center gap-1 shrink-0 font-medium transition-colors"
                      >
                        <span>Deep Scan URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation & Recommendations */}
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
