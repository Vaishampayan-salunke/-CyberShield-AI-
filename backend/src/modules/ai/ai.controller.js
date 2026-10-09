const AiPredictionService = require('../../services/aiPrediction.service');
const RiskScoreService = require('../../services/riskScore.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncCatch = require('../../utils/asyncCatch');
const axios = require('axios');
const config = require('../../config/environment');
const logger = require('../../utils/logger');

/**
 * @desc    Predict email threat classification using AI model / heuristic engine
 * @route   POST /api/ai/predict
 * @access  Public / API Key
 */
const predict = asyncCatch(async (req, res) => {
  const {
    subject = '',
    body = '',
    sender = '',
    headers = {},
    urls = [],
    attachments = []
  } = req.body;

  const result = await AiPredictionService.predict({
    subject,
    body,
    sender,
    headers,
    urls,
    attachments
  });

  return ApiResponse.success(res, result, 'AI prediction completed');
});

/**
 * @desc    Calculate consolidated risk score
 * @route   POST /api/ai/risk-score
 * @access  Public / API Key
 */
const calculateRiskScore = asyncCatch(async (req, res) => {
  const {
    aiPrediction = {},
    senderSignals = {},
    urls = [],
    attachments = [],
    extractedIPs = []
  } = req.body;

  const consolidated = RiskScoreService.consolidate({
    aiResult: aiPrediction,
    senderResult: senderSignals,
    urlResult: { results: urls, maliciousCount: urls.filter((u) => u.isBlacklisted || u.status === 'Malicious').length, overallUrlRiskScore: 0 },
    attachmentResult: { results: attachments, threatsFound: attachments.filter((a) => a.isExecutable || a.isDangerous).length, overallAttachmentRiskScore: 0 },
    extractedIPs
  });

  return ApiResponse.success(res, consolidated, 'Risk score calculated successfully');
});

module.exports = {
  predict,
  calculateRiskScore,
  chat
};

/**
 * @desc    Proxy AI Chat queries to FastAPI chat service
 * @route   POST /api/ai/chat
 * @access  Public
 */
async function chat(req, res) {
  const { question = '', context = null, apiKey = '', api_key = '' } = req.body;
  const geminiKey = apiKey || api_key || process.env.GEMINI_API_KEY || '';

  try {
    const response = await axios.post(
      `${config.aiService.url}/chat`,
      { question, context, api_key: geminiKey },
      { timeout: config.aiService.timeoutMs }
    );
    return ApiResponse.success(res, response.data, 'Chat response generated');
  } catch (err) {
    logger.warn(`AI Chat service unavailable: ${err.message}`);
    // Minimal fallback response
    return ApiResponse.success(res, {
      answer: 'The AI chat service is currently offline. Please ensure the FastAPI model service is running on port 8000.',
      suggestions: ['Why is this email phishing?', 'What is a risk score?', 'What is SPF?']
    }, 'Fallback chat response');
  }
}

