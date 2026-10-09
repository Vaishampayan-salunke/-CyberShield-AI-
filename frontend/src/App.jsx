import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiCopilotModal from './components/AiCopilotModal';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EmailAnalyzer from './pages/EmailAnalyzer';
import UrlScanner from './pages/UrlScanner';
import MessageAnalyzer from './pages/MessageAnalyzer';
import ScreenshotAnalyzer from './pages/ScreenshotAnalyzer';
import QrScanner from './pages/QrScanner';
import AiAssistantPage from './pages/AiAssistantPage';
import LearningCenter from './pages/LearningCenter';
import ThreatHistory from './pages/ThreatHistory';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export function AppContent() {
  const [activePage, setActivePage] = useState('landing');
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage
            setActivePage={setActivePage}
            onOpenAiCopilot={() => setIsCopilotModalOpen(true)}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            setActivePage={setActivePage}
            onOpenAiCopilot={() => setIsCopilotModalOpen(true)}
          />
        );
      case 'email':
        return <EmailAnalyzer setActivePage={setActivePage} />;
      case 'url':
        return <UrlScanner setActivePage={setActivePage} />;
      case 'message':
        return <MessageAnalyzer />;
      case 'screenshot':
        return <ScreenshotAnalyzer />;
      case 'qr':
        return <QrScanner />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'learning':
        return <LearningCenter />;
      case 'history':
        return <ThreatHistory />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      case 'signup':
        return <SignupPage setActivePage={setActivePage} />;
      default:
        return (
          <LandingPage
            setActivePage={setActivePage}
            onOpenAiCopilot={() => setIsCopilotModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAiCopilot={() => setIsCopilotModalOpen(true)}
      />

      {/* Main View */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Global AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotModalOpen}
        onClose={() => setIsCopilotModalOpen(false)}
      />

      {/* Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
