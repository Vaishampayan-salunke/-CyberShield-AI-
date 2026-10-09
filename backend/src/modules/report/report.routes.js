const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');

// NOTE: /download/:id MUST be registered before /:id to prevent Express
// from treating "download" as an id parameter value.
router.get('/download/:id', optionalAuth, reportController.downloadPdf);
router.get('/:id', optionalAuth, reportController.getReportById);

module.exports = router;
