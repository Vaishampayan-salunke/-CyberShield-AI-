import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Send, X, Bot, User, Shield, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function AiCopilotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your CyberShield AI Copilot. Ask me to explain a threat, evaluate suspicious text, or guide you through incident response.',
      time: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'How do I identify a phishing email?',
    'Is scanning a QR code to receive money safe?',
    'What is typosquatting?',
    'Steps to take after entering credentials on a fake site',
  ];

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.text }));
      const res = await api.chatWithAi(query, historyPayload);
      const botMsg = {
        role: 'assistant',
        text: res.reply || 'I analyzed your request according to CyberShield security standards.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I am temporarily operating in offline mode. For emergency threats, isolate the device and change your credentials immediately.',
          time: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-cyber-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-cyber-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    CyberShield AI Copilot
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Gemini Powered
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">SOC Expert Threat Analyst</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="px-6 py-2.5 bg-cyber-950/50 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-cyber-800 border border-slate-750 text-slate-200 rounded-tl-none whitespace-pre-line'
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
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-cyber-800 border border-slate-750 text-xs text-slate-300 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Analyzing threat vectors and generating security brief...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-cyber-850 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CyberShield Copilot about any cybersecurity question or threat..."
                  className="flex-1 bg-cyber-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
