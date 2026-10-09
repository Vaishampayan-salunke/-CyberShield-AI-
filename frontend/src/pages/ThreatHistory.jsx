import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  X,
  FileDown,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import ThreatScoreRadar from '../components/ThreatScoreRadar';
import IndicatorsList from '../components/IndicatorsList';
import AIExplanationCard from '../components/AIExplanationCard';

export default function ThreatHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(filterType);
      setScans(res.scans || []);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteHistory(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (e) {
      console.error('Error deleting scan:', e);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybershield_threat_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredScans = scans.filter((s) => {
    const title = (s.title || s.url || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || (s.threat_level || '').toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              Threat Intelligence Audit Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete historical audit trail of all email, URL, message, screenshot, and QR scans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threats by keyword, domain, or severity..."
            className="w-full bg-cyber-950 border border-slate-750 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Vector Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['all', 'email', 'url', 'message', 'screenshot', 'qr'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-cyan-600 text-white shadow-glow-blue'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Vectors' : t}
            </button>
          ))}
        </div>
      </div>

      {/* History Table / Cards */}
      <div className="cyber-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Vector</th>
                <th className="py-3.5 px-4">Threat Target / Subject</th>
                <th className="py-3.5 px-4">Threat Level</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">
                    No threat logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredScans.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedScan(item)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 uppercase">
                        {item.threat_type || 'SCAN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                      {item.title || item.url || 'Analyzed Item'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.threat_level === 'Critical'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : item.threat_level === 'High Risk'
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                            : item.threat_level === 'Medium Risk'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.threat_level || 'Safe'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {item.threat_score ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScan(item);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="View Full Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[85vh] bg-cyber-900 border border-slate-700 rounded-3xl overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 uppercase">
                    {selectedScan.threat_type} Full Report
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedScan.title || selectedScan.url}</h3>
                </div>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 flex justify-center">
                  <ThreatScoreRadar
                    score={selectedScan.threat_score}
                    level={selectedScan.threat_level}
                    confidence={selectedScan.confidence_score}
                  />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Indicators</h4>
                  <IndicatorsList indicators={selectedScan.detected_indicators} />
                </div>
              </div>

              <AIExplanationCard
                explanation={selectedScan.ai_explanation}
                potentialImpact={selectedScan.potential_impact}
                recommendedActions={selectedScan.recommended_actions}
                threatLevel={selectedScan.threat_level}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
