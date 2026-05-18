//فيه Routes الأساسية:
const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const {
  listWebhooks,
  createWebhook,
  listWebhookLogs,
  testWebhook,
  processFile
} = require('../controllers/webhookController');

const router = express.Router();

router.get('/api/webhooks', asyncHandler(listWebhooks));
router.post('/api/webhooks', asyncHandler(createWebhook));
router.get('/api/webhook-logs', asyncHandler(listWebhookLogs));
router.post('/test-webhook', asyncHandler(testWebhook));
router.post('/process-file', asyncHandler(processFile));

module.exports = router;
//تلقائيًا لـ errorHandler بدل ما السيرفر يقع.
