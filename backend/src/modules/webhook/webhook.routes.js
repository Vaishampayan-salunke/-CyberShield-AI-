const express = require('express');
const router = express.Router();
const webhookController = require('./webhook.controller');

router.post('/test', webhookController.testWebhook);

module.exports = router;
