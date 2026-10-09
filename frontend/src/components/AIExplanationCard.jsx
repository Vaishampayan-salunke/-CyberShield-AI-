import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, AlertOctagon, CheckSquare, Copy, Check } from 'lucide-react';

export default function AIExplanationCard({
  explanation = '',
  potentialImpact = '',
  recommendedActions = [],
  threatLevel = 'Safe',
}) {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Live typing effect
  useEffect(() => {
    if (!explanation) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      if (i >= explanation.length) {
        setDisplayedText(explanation);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(explanation.slice(0, i));
      }
    }, 12);

    return () => clearInterval(interval);
  }, [explanation]);

  const handleCopy = () => {
    const textToCopy = `Threat Explanation:\n${explanation}\n\nPotential Impact:\n${potentialImpact}\n\nRecommended Actions:\n${recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isThreat = threatLevel !== 'Safe' && threatLevel !== 'Low Risk';

  return (
    <div className="rounded-2xl bg-cyber-850/90 border border-slate-800/90 p-6 backdrop-blur-md shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Gemini AI Threat Intelligence & Reasoning
              {isTyping && (
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              )}
            </h3>
            <p className="text-xs text-slate-400">Deep explainability generated in plain human language</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Brief'}</span>
        </button>
      </div>

      {/* AI Explanation Paragraph */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 text-sm text-slate-200 leading-relaxed font-sans min-h-[70px]">
        {displayedText}
        {isTyping && <span className="inline-block w-1.5 h-4 bg-purple-400 ml-1 animate-pulse" />}
      </div>

      {/* Potential Impact */}
      {potentialImpact && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertOctagon className="w-4 h-4" />
            <span>Potential Impact & Risk Exposure</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
            {potentialImpact}
          </div>
        </div>
      )}

      {/* Recommended Action Checklist */}
      {recommendedActions && recommendedActions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Recommended Response Protocol</span>
          </div>
          <div className="space-y-2">
            {recommendedActions.map((action, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/70"
              >
                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 font-medium leading-relaxed">{action}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
