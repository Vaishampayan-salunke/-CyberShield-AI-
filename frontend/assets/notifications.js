/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Real-Time Threat Notification & Critical Alert System
 */

const ThreatAlert = {
  audioContext: null,

  playAlertSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioContext) this.audioContext = new AudioContext();
      
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Synthesize high-frequency SOC warble alarm
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio alarm playback error:', e);
    }
  },

  trigger(threat) {
    if (!threat) return;
    const verdict = (threat.verdict || 'phishing').toUpperCase();
    const risk = threat.riskScore || threat.risk_score || 85;
    const subject = threat.subject || (threat.emailId && threat.emailId.subject) || 'Urgent Account Action Required';
    const sender = typeof threat.sender === 'string' ? threat.sender : (threat.sender?.email || threat.emailId?.sender?.email || 'unknown@malicious.com');
    const reportId = threat.reportId || threat.id || threat._id || '';

    // Play synthesized alert sound
    this.playAlertSound();

    // Ensure alert overlay DOM exists
    let overlay = document.getElementById('threat-alert-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'threat-alert-overlay';
      document.body.appendChild(overlay);
    }

    const reasons = threat.aiAnalysis?.reasons || threat.reasons || ['Deceptive sender address', 'Suspicious URL redirect'];
    const reasonsHtml = reasons.slice(0, 3).map(r => `<div>🚨 ${escapeHtml(r)}</div>`).join('');

    overlay.innerHTML = `
      <div id="threat-alert-box">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div class="alert-pulse-ring">
            <svg width="28" height="28" viewBox="0 0 29.5 29.5" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span class="badge badge-malware" style="font-size:12px;">CRITICAL SOC ALERT</span>
        </div>

        <h3 class="alert-title">Critical Threat Intercepted</h3>
        <p class="alert-desc">
          Automated multi-layer AI security engine intercepted a high-confidence 
          <strong>${escapeHtml(verdict)}</strong> email with a threat risk score of 
          <strong style="color:var(--phish);">${risk}/100</strong>.
        </p>

        <div class="alert-ioc-preview">
          <div><strong style="color:var(--text-mid);">Subject:</strong> ${escapeHtml(subject)}</div>
          <div><strong style="color:var(--text-mid);">Sender:</strong> <span class="mono" style="color:var(--cyan);">${escapeHtml(sender)}</span></div>
          <div style="margin-top:4px; padding-top:4px; border-top:1px solid var(--border-soft); font-size:11px; color:var(--text-mid);">
            ${reasonsHtml}
          </div>
        </div>

        <div class="alert-actions">
          <button class="btn btn-outline" onclick="ThreatAlert.dismiss()">Dismiss Alert</button>
          <button class="btn btn-danger" onclick="ThreatAlert.blockAndQuarantine('${escapeHtml(sender)}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            Quarantine Sender
          </button>
          ${reportId ? `<button class="btn btn-primary" onclick="window.location.href='threat-report.html?id=${reportId}'">View Threat Dossier</button>` : ''}
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
  },

  dismiss() {
    const overlay = document.getElementById('threat-alert-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  blockAndQuarantine(sender) {
    this.dismiss();
    notify(`Domain '${sender.split('@')[1] || sender}' added to SOC gateway blocklist.`, 'success');
  }
};

// Global export
window.ThreatAlert = ThreatAlert;
