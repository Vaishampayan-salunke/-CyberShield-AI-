import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';
import { api } from '../services/api';

export default function LearningCenter() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' or 'quiz'
  const [selectedModule, setSelectedModule] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await api.getLearningModules();
        setData(res);
        if (res.modules && res.modules.length > 0) {
          setSelectedModule(res.modules[0]);
        }
      } catch (e) {
        console.error('Error loading learning modules:', e);
      }
    }
    loadContent();
  }, []);

  const handleSelectOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!data?.quiz) return;
    let correctCount = 0;
    data.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_index) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  const modules = data?.modules || [];
  const quiz = data?.quiz || [];

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              Cyber Threat Academy & Learning Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Master threat recognition, understand social engineering manipulation, and test your cyber defense acumen.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-cyber-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'modules' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Defense Modules
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'quiz' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scam IQ Quiz Simulator
          </button>
        </div>
      </div>

      {activeTab === 'modules' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Module Selection Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Curriculum Tracks</div>
            {modules.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedModule(m)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedModule?.id === m.id
                    ? 'bg-purple-600/15 border-purple-500/50 shadow-glow-purple'
                    : 'bg-cyber-900/80 border-slate-800/80 hover:border-slate-750 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">
                    {m.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{m.estimated_time}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{m.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{m.summary}</p>
              </div>
            ))}
          </div>

          {/* Module Deep-Dive View */}
          <div className="lg:col-span-8">
            {selectedModule && (
              <motion.div
                key={selectedModule.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card p-6 sm:p-8 rounded-2xl space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {selectedModule.badge}
                    </span>
                    <span className="text-xs text-slate-400">• Level: {selectedModule.level}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white font-display">{selectedModule.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{selectedModule.summary}</p>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Core Principles</h3>
                  <div className="space-y-2">
                    {selectedModule.key_takeaways?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attack Anatomy Walkthrough */}
                {selectedModule.attack_anatomy && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Step-by-Step Attack Anatomy</h3>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3 text-xs text-slate-300">
                      {Object.entries(selectedModule.attack_anatomy).map(([step, desc], idx) => (
                        <div key={step} className="flex items-start gap-3">
                          <span className="font-mono font-bold text-amber-400 shrink-0">0{idx + 1}.</span>
                          <span className="leading-relaxed">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Defense Checklist */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Actionable Defense Checklist</h3>
                  <div className="space-y-2">
                    {selectedModule.defense_checklist?.map((check, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Scam IQ Quiz Simulator */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="cyber-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Scam IQ & Phishing Defense Simulator</h3>
                <p className="text-xs text-slate-400">Evaluate real-world crisis situations and earn your Cyber Defense Badge.</p>
              </div>
              {quizSubmitted && (
                <button
                  onClick={handleResetQuiz}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Retry Quiz</span>
                </button>
              )}
            </div>

            {/* Score Banner when submitted */}
            {quizSubmitted && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-sm font-bold text-white">
                      Quiz Score: {score} / {quiz.length} Correct
                    </div>
                    <div className="text-xs text-slate-300">
                      {score === quiz.length
                        ? 'Master Cyber Sentinel Rating Achieved!'
                        : 'Review the explanations below to sharpen your defense instincts.'}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-purple-400 font-display">
                  {Math.round((score / quiz.length) * 100)}%
                </div>
              </motion.div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {quiz.map((q, qIdx) => (
                <div key={q.id} className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <div className="text-xs sm:text-sm font-bold text-slate-200">
                    <span className="text-purple-400 font-mono mr-2">Q{qIdx + 1}.</span>
                    {q.question}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      const isCorrect = q.correct_index === optIdx;

                      let btnStyle = 'bg-slate-800/70 border-slate-750 text-slate-300 hover:bg-slate-750';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-red-500/20 border-red-500/50 text-red-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-glow-purple';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full p-3 rounded-xl border text-xs text-left transition-colors flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="font-mono font-bold shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                      <span className="font-bold block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!quizSubmitted && (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < quiz.length}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-glow-purple transition-all disabled:opacity-50"
              >
                Submit Answers for Scoring
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
