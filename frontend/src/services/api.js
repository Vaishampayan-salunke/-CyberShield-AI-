const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('cybershield_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Registration failed');
    return json;
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Login failed');
    return json;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  },

  // Scanners
  async scanQuick(content) {
    const res = await fetch(`${API_BASE}/scan/quick`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Quick scan failed');
    return json;
  },

  async scanEmail(data) {
    const res = await fetch(`${API_BASE}/scan/email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Email scan failed');
    return json;
  },

  async uploadEmailFile(file) {
    const token = localStorage.getItem('cybershield_token');
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/scan/email/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Email upload failed');
    return json;
  },

  async scanUrl(url) {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'URL scan failed');
    return json;
  },

  async scanMessage(message) {
    const res = await fetch(`${API_BASE}/scan/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Message scan failed');
    return json;
  },

  async scanScreenshot(file, clientText = '') {
    const token = localStorage.getItem('cybershield_token');
    const formData = new FormData();
    formData.append('file', file);
    if (clientText) formData.append('client_text', clientText);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/scan/screenshot`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Screenshot scan failed');
    return json;
  },

  async scanQr(file = null, fallbackUrl = '') {
    const token = localStorage.getItem('cybershield_token');
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (fallbackUrl) formData.append('fallback_url', fallbackUrl);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/scan/qr`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'QR scan failed');
    return json;
  },

  // AI Copilot
  async chatWithAi(message, history = []) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, history }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'AI Assistant unavailable');
    return json;
  },

  // Dashboard & History
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async getDashboardTrends() {
    const res = await fetch(`${API_BASE}/dashboard/trends`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async getHistory(threatType = 'all') {
    const res = await fetch(`${API_BASE}/history?threat_type=${threatType}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async deleteHistory(scanId) {
    const res = await fetch(`${API_BASE}/history/${scanId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  // Learning Modules
  async getLearningModules() {
    const res = await fetch(`${API_BASE}/learning/modules`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },
};
