/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * SIEM & Incident Notification Webhook Service
 * Dispatches real-time alerts to Slack, Discord, MS Teams, and Custom SIEM Webhooks
 */

const axios = require('axios');
const logger = require('../utils/logger');

class WebhookService {
  constructor() {
    this.timeout = 5000;
  }

  /**
   * Format Slack-compatible payload
   */
  formatSlackPayload(alertData) {
    const { emailId, subject, sender, verdict, riskScore, reasons, reportUrl } = alertData;
    const color = riskScore >= 80 ? '#dc2626' : (riskScore >= 55 ? '#ef4444' : '#f59e0b');

    return {
      text: `🚨 *[CRITICAL EMAIL THREAT DETECTED]* — Threatline ETIP SOC Alert`,
      attachments: [
        {
          color: color,
          title: `Threat Dossier: ${verdict.toUpperCase()} (Risk Score: ${riskScore}/100)`,
          title_link: reportUrl || 'http://localhost:5000/threat-report.html',
          fields: [
            { title: 'Subject', value: subject || '(No Subject)', short: true },
            { title: 'Sender', value: sender || 'Unknown', short: true },
            { title: 'Threat Classification', value: verdict.toUpperCase(), short: true },
            { title: 'Risk Score', value: `${riskScore} / 100`, short: true },
            {
              title: 'Forensic Trigger Reasons',
              value: reasons && reasons.length ? reasons.slice(0, 4).map(r => `• ${r}`).join('\n') : '• Multi-vector threat indicators detected',
              short: false
            }
          ],
          footer: 'SIH26106 Threatline ETIP • Autonomous Threat Intelligence',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
  }

  /**
   * Format Discord-compatible payload
   */
  formatDiscordPayload(alertData) {
    const { subject, sender, verdict, riskScore, reasons } = alertData;
    const color = riskScore >= 80 ? 14423100 : 15671876;

    return {
      username: 'Threatline SOC Gateway',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
      embeds: [
        {
          title: `🚨 CRITICAL EMAIL THREAT DETECTED — ${verdict.toUpperCase()}`,
          description: `An email threat scored **${riskScore}/100** and was quarantined by the SIH26106 AI Threat Engine.`,
          color: color,
          fields: [
            { name: 'Subject', value: `\`${subject || '(No Subject)'}\``, inline: true },
            { name: 'Sender', value: `\`${sender || 'Unknown'}\``, inline: true },
            { name: 'Risk Score', value: `**${riskScore} / 100**`, inline: true },
            {
              name: 'Forensic Reasons',
              value: reasons && reasons.length ? reasons.slice(0, 4).map(r => `• ${r}`).join('\n') : '• Suspicious email headers & deceptive link patterns'
            }
          ],
          footer: { text: 'Threatline ETIP • SIEM Incident Response' },
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  /**
   * Dispatch alert to a webhook URL
   */
  async sendAlert(webhookUrl, alertData, type = 'generic') {
    if (!webhookUrl || !webhookUrl.trim()) return { success: false, message: 'No webhook URL provided' };

    try {
      let payload = alertData;

      if (type === 'slack' || webhookUrl.includes('slack.com')) {
        payload = this.formatSlackPayload(alertData);
      } else if (type === 'discord' || webhookUrl.includes('discord.com')) {
        payload = this.formatDiscordPayload(alertData);
      } else {
        payload = {
          event: 'THREAT_INTERCEPTED',
          timestamp: new Date().toISOString(),
          platform: 'SIH26106 Threatline ETIP',
          ...alertData
        };
      }

      const res = await axios.post(webhookUrl.trim(), payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeout
      });

      logger.info(`Webhook dispatched successfully to: ${webhookUrl.slice(0, 30)}... status: ${res.status}`);
      return { success: true, status: res.status, message: 'Webhook dispatched successfully' };
    } catch (err) {
      logger.warn(`Failed to dispatch webhook to: ${webhookUrl.slice(0, 30)}...: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new WebhookService();
