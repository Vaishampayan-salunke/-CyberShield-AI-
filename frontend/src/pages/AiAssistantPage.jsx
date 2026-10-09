import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to CyberShield AI Copilot. I am an intelligent cybersecurity assistant powered by Google Gemini API and expert SOC knowledge. Ask me about phishing tactics, UPI safety, typosquatting domains, or how to respond to an active security incident.',
      time: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const presetQueries = [
    { title: '🎣 Phishing Identification', prompt: 'What are the top 5 signs that an email is a sophisticated phishing attack?' },
    { title: '💳 UPI & QR Safety Rule', prompt: 'Explain the golden rule of UPI fraud prevention and why scammers use QR codes.' },
    { title: '🌐 Typosquatting & Lookalike Domains', prompt: 'How do hackers use typosquatting and homograph attacks to impersonate banks?' },
    { title: '🚨 Incident Response Steps', prompt: 'What should I immediately do if I accidentally entered my password on a suspicious website?' },
  ];

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.text }));
      const res = await api.chatWithAi(textToSend, historyPayload);
      const botMsg = {
        role: 'assistant',
        text: res.reply || 'Security response generated.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Operating in localized fallback mode: Always isolate suspicious devices, freeze compromised bank cards via official banking apps, and never share OTPs.',
          time: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Conversation reset. How can I assist with your cybersecurity posture today?',
        time: 'Now',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              Gemini AI Security Copilot
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Autonomous threat advisor for real-time risk triage, attack explanation, and remediation protocols.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presetQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="p-3.5 rounded-xl bg-cyber-900 border border-slate-800 hover:border-purple-500/40 text-left transition-all hover:scale-[1.01] space-y-1"
          >
            <div className="text-xs font-bold text-slate-200">{item.title}</div>
            <div className="text-[11px] text-slate-400 truncate">{item.prompt}</div>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="cyber-card rounded-2xl border border-slate-800 h-[520px] flex flex-col overflow-hidden shadow-2xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    m.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Consulting Gemini Threat Intelligence Engine...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-cyber-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about email safety, suspicious links, UPI traps, or SOC incident response..."
              className="flex-1 bg-cyber-900 border border-slate-750 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-glow-purple flex items-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
