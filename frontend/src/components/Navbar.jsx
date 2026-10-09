import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Mail,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  QrCode,
  GraduationCap,
  History,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, onOpenAiCopilot }) {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [scannersOpen, setScannersOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const scannerItems = [
    { id: 'email', name: 'Email Threat Analyzer', icon: Mail, desc: 'Analyze .eml and body text with SPF/DKIM' },
    { id: 'url', name: 'URL & Website Scanner', icon: Globe, desc: 'Typosquatting, SSL & phishing model' },
    { id: 'message', name: 'Scam Message Detector', icon: MessageSquare, desc: 'SMS, WhatsApp & UPI fraud patterns' },
    { id: 'screenshot', name: 'Screenshot OCR Analyzer', icon: ImageIcon, desc: 'Optical character text scam extraction' },
    { id: 'qr', name: 'QR Security Scanner', icon: QrCode, desc: 'Decode QR destination & Quishing traps' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-cyber-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-glow-blue group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-display">
                  CyberShield
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI V2
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block tracking-wide font-medium">
                SOC Threat Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActivePage('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'landing'
                  ? 'text-white bg-slate-800/90 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'dashboard'
                  ? 'text-white bg-slate-800/90 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>SOC Dashboard</span>
            </button>

            {/* Scanners Dropdown */}
            <div className="relative">
              <button
                onClick={() => setScannersOpen(!scannersOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  ['email', 'url', 'message', 'screenshot', 'qr'].includes(activePage)
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Threat Scanners</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${scannersOpen ? 'rotate-180' : ''}`} />
              </button>

              {scannersOpen && (
                <div
                  onMouseLeave={() => setScannersOpen(false)}
                  className="absolute top-full left-0 mt-2 w-72 p-2 bg-cyber-900 border border-slate-750 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
                >
                  {scannerItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActivePage(item.id);
                          setScannersOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                          activePage === item.id
                            ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-blue-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{item.name}</div>
                          <div className="text-[11px] text-slate-400 leading-snug">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setActivePage('learning')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'learning'
                  ? 'text-white bg-slate-800/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>Learning Hub</span>
            </button>

            <button
              onClick={() => setActivePage('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'history'
                  ? 'text-white bg-slate-800/90'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Threat History</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* AI Copilot Button */}
            <button
              onClick={onOpenAiCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 border border-purple-500/30 shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{user?.name || 'Analyst'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 top-full mt-2 w-56 p-2 bg-cyber-900 border border-slate-750 rounded-2xl shadow-2xl z-50 text-xs"
                  >
                    <div className="p-2 border-b border-slate-800 mb-1">
                      <div className="font-bold text-white">{user?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <div className="text-[10px] text-blue-400 mt-1 font-mono">{user?.role || 'SOC Analyst'}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={loginAsDemo}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <span>Demo SOC Login</span>
                </button>
                <button
                  onClick={() => setActivePage('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cyber-900 border-b border-slate-800 px-4 py-4 space-y-2 text-xs">
          <button
            onClick={() => {
              setActivePage('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200"
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActivePage('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>SOC Dashboard</span>
          </button>
          {scannerItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 pl-4"
            >
              <span>{item.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setActivePage('learning');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Learning Hub</span>
          </button>
          <button
            onClick={() => {
              setActivePage('history');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Threat History</span>
          </button>
        </div>
      )}
    </nav>
  );
}
