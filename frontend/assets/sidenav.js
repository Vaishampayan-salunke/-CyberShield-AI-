/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Unified Sidebar Navigation Component
 */

function renderSidenav() {
  const sidenav = document.getElementById('sidenav');
  if (!sidenav) return;

  const currentPage = document.body.dataset.page || '';
  const user = getUser() || { name: 'SOC Analyst', role: 'Security Ops', email: 'analyst@etip.io' };

  sidenav.innerHTML = `
    <div class="nav-brand">
      <div class="nav-logo-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <div>
        <div class="nav-brand-title">THREATLINE</div>
        <div class="nav-brand-sub">ETIP • SOC CONSOLE</div>
      </div>
    </div>

    <div class="nav-section-title">Core Operations</div>
    <ul class="nav-list">
      <li class="nav-item">
        <a href="index.html" class="${currentPage === 'dashboard' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
      </li>
      <li class="nav-item">
        <a href="upload-email.html" class="${currentPage === 'upload' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload Email (.eml)
        </a>
      </li>
      <li class="nav-item">
        <a href="analyze-email.html" class="${currentPage === 'analyze' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          Analyze & Inspect
        </a>
      </li>
      <li class="nav-item">
        <a href="history.html" class="${currentPage === 'history' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Scan History
        </a>
      </li>
    </ul>

    <div class="nav-section-title">Telemetry & Intel</div>
    <ul class="nav-list">
      <li class="nav-item">
        <a href="realtime-map.html" class="${currentPage === 'realtime-map' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Live Threat Map
          <span class="nav-badge" style="background:rgba(239,68,68,0.2);color:#ef4444;border-color:rgba(239,68,68,0.4);font-weight:700;letter-spacing:0.08em;">● LIVE</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="analytics.html" class="${currentPage === 'analytics' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          Threat Analytics
        </a>
      </li>
      <li class="nav-item">
        <a href="simulation.html" class="${currentPage === 'simulation' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          Phish Simulation
          <span class="nav-badge" style="background:rgba(16,185,129,0.2);color:#10b981;border-color:rgba(16,185,129,0.4);font-weight:700;">TRAIN</span>
        </a>
      </li>

      <li class="nav-item">
        <a href="settings.html" class="${currentPage === 'settings' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings & Keys
        </a>
      </li>
    </ul>

    <div class="nav-footer">
      <div class="analyst-pill">
        <div class="analyst-avatar">${(user.name || 'A')[0].toUpperCase()}</div>
        <div class="analyst-info">
          <div class="analyst-name">${escapeHtml(user.name || 'SOC Analyst')}</div>
          <div class="analyst-role">${escapeHtml(user.role || 'Analyst Tier 2')}</div>
        </div>
        <button onclick="AuthAPI.logout()" class="btn btn-ghost btn-sm" title="Sign out" style="padding:4px;color:var(--text-low);">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      <div class="system-status">
        <div class="status-dot"></div>
        <span>AI Engine Online (Port 8000)</span>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidenav();
  addMobileMenuSupport();
});

function addMobileMenuSupport() {
  const topbar = document.querySelector('.topbar');
  const sidenav = document.getElementById('sidenav');
  if (!topbar || !sidenav) return;

  // Add overlay for closing
  let overlay = document.getElementById('sidenav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidenav-overlay';
    overlay.className = 'sidenav-overlay';
    overlay.addEventListener('click', closeMobileMenu);
    document.body.appendChild(overlay);
  }

  // Inject hamburger button into topbar if not present
  if (!document.getElementById('mobile-menu-btn')) {
    const btn = document.createElement('button');
    btn.id = 'mobile-menu-btn';
    btn.className = 'mobile-menu-btn';
    btn.innerHTML = '☰';
    btn.setAttribute('aria-label', 'Open navigation menu');
    btn.addEventListener('click', toggleMobileMenu);
    topbar.insertBefore(btn, topbar.firstChild);
  }
}

function toggleMobileMenu() {
  const sidenav = document.getElementById('sidenav');
  const overlay = document.getElementById('sidenav-overlay');
  if (!sidenav) return;
  const isOpen = sidenav.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open', isOpen);
}

function closeMobileMenu() {
  const sidenav = document.getElementById('sidenav');
  const overlay = document.getElementById('sidenav-overlay');
  if (sidenav) sidenav.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}
