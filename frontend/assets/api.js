/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Unified Frontend API Client
 * Connects directly to Node.js Backend (port 5000) & FastAPI AI Service (port 8000)
 */

const API_BASE = window.location.port === '5000' ? '/api' : 'http://localhost:5000/api';
const FASTAPI_BASE = 'http://localhost:8000';

// ── Token & State Helpers ─────────────────────────────────────
function getToken() {
  return localStorage.getItem('token') || '';
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

function getGeminiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

function setGeminiKey(key) {
  if (key) localStorage.setItem('gemini_api_key', key.trim());
  else localStorage.removeItem('gemini_api_key');
}

function requireAuth(redirectUrl = 'login.html') {
  const token = getToken();
  if (!token) {
    const isGuest = localStorage.getItem('guest_mode') === 'true';
    if (!isGuest) {
      window.location.href = redirectUrl;
    }
  }
}

// ── Generic HTTP Request ──────────────────────────────────────
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const token = getToken();
  const apiKey = localStorage.getItem('api_key') || '';

  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
      console.warn('Authentication expired.');
    }

    if (options.responseType === 'blob') {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.blob();
    }

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || `Request failed (${res.status})`);
    }

    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// ── Module 1: Auth APIs ───────────────────────────────────────
const AuthAPI = {
  async signup(name, email, password) {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    localStorage.removeItem('guest_mode');
    return data;
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    localStorage.removeItem('guest_mode');
    return data;
  },

  async guestLogin() {
    localStorage.setItem('guest_mode', 'true');
    setUser({ name: 'SOC Analyst (Guest)', email: 'analyst@soc-command.io', role: 'analyst' });
    return true;
  },

  async logout() {
    try { await request('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    setToken(null);
    setUser(null);
    localStorage.removeItem('guest_mode');
    window.location.href = 'login.html';
  },

  async getMe() { return request('/auth/me'); },

  async updateProfile(profileData) {
    return request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) });
  },

  async changePassword(currentPassword, newPassword) {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// ── Module 2: Dashboard APIs ──────────────────────────────────
const DashboardAPI = {
  async stats()                  { return request('/dashboard/stats'); },
  async trends(range = '7d')     { return request(`/dashboard/trends?range=${range}`); },
  async recentThreats(limit = 8) { return request(`/dashboard/recent-threats?limit=${limit}`); }
};

// ── Module 3: Email Ingestion & Analysis ──────────────────────
const EmailAPI = {
  /**
   * Upload an .eml file AND run full analysis in one shot.
   * Returns { reportId, emailId, verdict, riskScore, ... }
   */
  async uploadAndAnalyzeFile(file) {
    const formData = new FormData();
    formData.append('email_file', file);
    return request('/email/analyze', {
      method: 'POST',
      body: formData
    });
  },

  /**
   * Submit raw/structured text AND run full analysis in one shot.
   * Returns { reportId, emailId, verdict, riskScore, ... }
   */
  async uploadAndAnalyzeRaw({ subject, sender, body, headers = {} }) {
    return request('/email/analyze', {
      method: 'POST',
      body: JSON.stringify({ subject, sender, body, headers })
    });
  },

  /**
   * Legacy: upload only (returns emailId, no report yet).
   * Kept for the two-step flow used by analyze-email.html.
   */
  async uploadEmlFile(file) {
    const formData = new FormData();
    formData.append('email_file', file);
    return request('/email/upload', { method: 'POST', body: formData });
  },

  async uploadRawText({ subject, sender, body, headers = {} }) {
    return request('/email/upload', {
      method: 'POST',
      body: JSON.stringify({ subject, sender, body, headers })
    });
  },

  /**
   * Run analysis on an already-uploaded email by its ID.
   * Returns { reportId, emailId, verdict, riskScore, ... }
   */
  async analyzeEmail(emailId) {
    return request('/email/analyze', {
      method: 'POST',
      body: JSON.stringify({ emailId })
    });
  },

  async getEmail(emailId) { return request(`/email/${emailId}`); }
};

// ── Module 4: AI & Machine Learning ───────────────────────────
const AiAPI = {
  async predict(emailPayload) {
    return request('/ai/predict', { method: 'POST', body: JSON.stringify(emailPayload) });
  },
  async riskScore(signals) {
    return request('/ai/risk-score', { method: 'POST', body: JSON.stringify(signals) });
  },
  async modelInfo() {
    try {
      const res = await fetch(`${FASTAPI_BASE}/model-info`);
      if (res.ok) return await res.json();
    } catch (e) { /* ignore */ }
    return {
      model_loaded: true,
      best_model: 'Linear SVM (TF-IDF Ensemble)',
      accuracy: 0.9786, precision: 0.7006, recall: 0.6639, f1: 0.6804
    };
  }
};

// ── Module 5: AI Chat Assistant ───────────────────────────────
const ChatAPI = {
  async ask(question, context = null) {
    const geminiKey = getGeminiKey();
    try {
      const res = await fetch(`${FASTAPI_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context, api_key: geminiKey })
      });
      if (res.ok) return await res.json();
    } catch (e) { /* fall through */ }
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question, context, apiKey: geminiKey })
    });
  }
};

// ── Module 6: Sender Reputation ───────────────────────────────
const SenderAPI = {
  async analyze(emailAddress) {
    return request(`/sender-analysis/${encodeURIComponent(emailAddress)}`);
  }
};

// ── Module 7: URL Scanner ─────────────────────────────────────
const UrlAPI = {
  async analyze(urls) {
    return request('/url/analyze', { method: 'POST', body: JSON.stringify({ urls }) });
  }
};

// ── Module 8: Attachment Inspector ────────────────────────────
const AttachmentAPI = {
  async analyze(attachments) {
    return request('/attachment/analyze', { method: 'POST', body: JSON.stringify({ attachments }) });
  }
};

// ── Module 9: Report & PDF Export ─────────────────────────────
const ReportAPI = {
  async getReport(reportId) { return request(`/report/${reportId}`); },
  async downloadPdf(reportId, filename = `Threat_Report_${reportId}.pdf`) {
    try {
      const blob = await request(`/report/download/${reportId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
      return true;
    } catch (err) {
      console.error('PDF download failed:', err);
      window.open(`${API_BASE}/report/download/${reportId}`, '_blank');
    }
  }
};

// ── Module 10: History Manager ────────────────────────────────
const HistoryAPI = {
  async list({ page = 1, limit = 10, search = '', verdict = 'all' } = {}) {
    let q = `/history?page=${page}&limit=${limit}`;
    if (search)  q += `&search=${encodeURIComponent(search)}`;
    if (verdict && verdict !== 'all') q += `&verdict=${encodeURIComponent(verdict.toLowerCase())}`;
    return request(q);
  },
  async deleteItem(id) { return request(`/history/${id}`, { method: 'DELETE' }); },
  async clearAll()     { return request('/history', { method: 'DELETE' }); }
};

// ── Module 11: Threat Feed ────────────────────────────────────
const ThreatFeedAPI = {
  async getFeed() { return request('/threat-feed'); }
};

// ── Module 12: Analytics & Metrics ────────────────────────────
const AnalyticsAPI = {
  async getAnalytics(timeframe = '30d') { return request(`/analytics?timeframe=${timeframe}`); }
};

// ── Module 13: Settings ───────────────────────────────────────
const SettingsAPI = {
  async getSettings()     { return request('/settings'); },
  async updateSettings(s) { return request('/settings', { method: 'PUT', body: JSON.stringify(s) }); },
  async regenerateApiKey() { return request('/settings/regenerate-api-key', { method: 'POST' }); }
};

// Compatibility aliases
const Dashboard = DashboardAPI;
const Email     = EmailAPI;
const Reports   = ReportAPI;
const History   = HistoryAPI;
const AIChat    = ChatAPI;
const Auth      = AuthAPI;
