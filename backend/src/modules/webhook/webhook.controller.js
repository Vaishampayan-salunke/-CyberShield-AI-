/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Webhook Controller
 */

const webhookService = require('../../services/webhook.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncCatch = require('../../utils/asyncCatch');

const testWebhook = asyncCatch(async (req, res) => {
  const { webhookUrl, type = 'generic' } = req.body;

  if (!webhookUrl) {
    return res.status(400).json({ success: false, message: 'Please provide a valid webhookUrl' });
  }

  const sampleAlert = {
    emailId: 'test_alert_998822',
    subject: '⚠️ CRITICAL: Urgent Verification Required for Corporate Mailbox',
    sender: 'security-alert@spoofed-domain.xyz',
    verdict: 'phishing',
    riskScore: 88,
    reasons: [
      'SPF authentication failure (Sender domain spoofed)',
      'High urgency psychological coercion keywords',
      'Deceptive URL redirecting to credential harvester'
    ],
    timestamp: new Date().toISOString()
  };

  const result = await webhookService.sendAlert(webhookUrl, sampleAlert, type);

  if (result.success) {
    return ApiResponse.success(res, result, 'Test webhook dispatched successfully');
  } else {
    return res.status(500).json({ success: false, message: result.error || 'Failed to dispatch webhook' });
  }
});

module.exports = {
  testWebhook
};
