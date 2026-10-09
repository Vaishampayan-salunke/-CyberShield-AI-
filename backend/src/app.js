const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/environment');
const morganMiddleware = require('./middlewares/logger.middleware');
const { generalLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const setupSwagger = require('./config/swagger');

// ── Module Routers ──────────────────────────────────────────
const authRoutes       = require('./modules/auth/auth.routes');
const dashboardRoutes  = require('./modules/dashboard/dashboard.routes');
const emailRoutes      = require('./modules/email/email.routes');
const aiRoutes         = require('./modules/ai/ai.routes');
const senderRoutes     = require('./modules/sender/sender.routes');
const urlRoutes        = require('./modules/url/url.routes');
const attachmentRoutes = require('./modules/attachment/attachment.routes');
const reportRoutes     = require('./modules/report/report.routes');
const historyRoutes    = require('./modules/history/history.routes');
const threatFeedRoutes = require('./modules/threatFeed/threatFeed.routes');
const analyticsRoutes  = require('./modules/analytics/analytics.routes');
const settingsRoutes   = require('./modules/settings/settings.routes');
const webhookRoutes    = require('./modules/webhook/webhook.routes');


// ── Controllers used for alias (compatibility) routes ───────
const authController    = require('./modules/auth/auth.controller');
const emailController   = require('./modules/email/email.controller');
const reportController  = require('./modules/report/report.controller');
const historyController = require('./modules/history/history.controller');
const senderController  = require('./modules/sender/sender.controller');
const threatFeedController = require('./modules/threatFeed/threatFeed.controller');
const analyticsController  = require('./modules/analytics/analytics.controller');
const upload            = require('./middlewares/upload.middleware');
const { optionalAuth }  = require('./middlewares/auth.middleware');

const app = express();

// ── Security ────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// ── Body parsers ────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── Logging & rate limiting ─────────────────────────────────
app.use(morganMiddleware);
app.use('/api/', generalLimiter);

// ── Swagger docs ────────────────────────────────────────────
setupSwagger(app);

const path = require('path');

// ── Static Frontend Serving ─────────────────────────────────
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/app', express.static(path.join(__dirname, '../../frontend')));

// ── Health check ────────────────────────────────────────────
app.get(['/health', '/api/health'], (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.status(200).json({
    status: 'online',
    platform: 'SIH26106 Email Threat Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    db: dbStatus,
    documentation: '/api-docs'
  });
});


// ── Primary API routes (/api prefix) ───────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/dashboard',       dashboardRoutes);
app.use('/api/email',           emailRoutes);
app.use('/api/ai',              aiRoutes);
app.use('/api/sender-analysis', senderRoutes);
app.use('/api/url',             urlRoutes);
app.use('/api/attachment',      attachmentRoutes);
app.use('/api/report',          reportRoutes);   // /download/:id registered first inside this router
app.use('/api/history',         historyRoutes);
app.use('/api/threat-feed',     threatFeedRoutes);
app.use('/api/analytics',       analyticsRoutes);
app.use('/api/settings',        settingsRoutes);
app.use('/api/webhook',         webhookRoutes);
app.use('/api/webhooks',        webhookRoutes);


// ── Compatibility alias routes (rootless, no /api prefix) ───
// NOTE: /report/download/:id must come before /report/:id
app.post('/login',        authController.login);
app.post('/signup',       authController.signup);
app.post('/upload-email', optionalAuth, upload.single('email_file'), emailController.uploadEmail);
app.post('/analyze',      optionalAuth, upload.single('email_file'), emailController.analyzeEmail);
app.get('/report/download/:id', optionalAuth, reportController.downloadPdf);
app.get('/report/:id',    optionalAuth, reportController.getReportById);
app.get('/history',       optionalAuth, historyController.getHistory);
app.delete('/history/:id', optionalAuth, historyController.deleteHistoryItem);
app.delete('/history',     optionalAuth, historyController.clearHistory);
app.get('/sender-analysis/:email', optionalAuth, senderController.analyzeSender);
app.get('/threat-feed',    optionalAuth, threatFeedController.getThreatFeed);
app.get('/analytics',      optionalAuth, analyticsController.getAnalytics);

// ── Error handling ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
