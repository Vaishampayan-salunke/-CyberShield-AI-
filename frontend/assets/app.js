/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Core Frontend App Utilities & UI Helpers
 */

function riskColor(score) {
  const s = Number(score) || 0;
  if (s >= 80) return 'var(--malware)';
  if (s >= 55) return 'var(--phish)';
  if (s >= 25) return 'var(--spam)';
  return 'var(--safe)';
}

function riskLevelLabel(score) {
  const s = Number(score) || 0;
  if (s >= 80) return 'Critical Threat';
  if (s >= 55) return 'High Risk';
  if (s >= 25) return 'Suspicious';
  return 'Clean / Low Risk';
}

function badgeHtml(verdict) {
  const v = (verdict || 'unknown').toLowerCase();
  if (v === 'safe') return '<span class="badge badge-safe"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>SAFE</span>';
  if (v === 'spam') return '<span class="badge badge-spam"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>SPAM</span>';
  if (v === 'phishing') return '<span class="badge badge-phish"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>PHISHING</span>';
  if (v === 'malware') return '<span class="badge badge-malware"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>MALWARE</span>';
  return `<span class="badge badge-neutral">${escapeHtml(v.toUpperCase())}</span>`;
}

function renderGauge(container, score = 0) {
  if (!container) return;
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circ - (clamped / 100) * circ;
  const color = riskColor(clamped);

  container.innerHTML = `
    <div class="gauge-container">
      <svg class="gauge-svg" viewBox="0 0 160 160">
        <circle class="gauge-bg" cx="80" cy="80" r="${radius}" />
        <circle class="gauge-fill" cx="80" cy="80" r="${radius}"
          stroke="${color}"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${circ}"
          id="gauge-fill-circle" />
      </svg>
      <div class="gauge-center">
        <div class="gauge-score" style="color:${color};">${clamped}</div>
        <div class="gauge-label">RISK SCORE</div>
      </div>
    </div>
  `;

  // Animate stroke offset
  setTimeout(() => {
    const circle = container.querySelector('#gauge-fill-circle');
    if (circle) circle.style.strokeDashoffset = offset;
  }, 50);
}

function fmtDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}

function fmtDateShort(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function notify(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function wireTabs(container) {
  if (!container) return;
  const tabs = container.querySelectorAll('.tab');
  const panels = container.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => (p.style.display = 'none'));

      tab.classList.add('active');
      const activePanel = container.querySelector(`#tab-${target}`);
      if (activePanel) activePanel.style.display = 'block';
    });
  });
}

function wireDropzone(zone, fileInput, onFileSelected) {
  if (!zone || !fileInput) return;

  zone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('click', (e) => e.stopPropagation());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
    fileInput.value = '';
  });
}
