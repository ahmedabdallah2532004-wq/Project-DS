const crypto = require('crypto');
const axios = require('axios');

function serviceUrl(name) {
  return process.env[name];
}

async function postStep(url, path, payload, requestId) {
  const response = await axios.post(`${url}${path}`, payload, {
    headers: {
      'x-request-id': requestId
    }
  });

  return response.data;
}

async function recordSidecarEvents(jobId, stage, payload, requestId) {
  const events = [];

  if (serviceUrl('ACCESS_ANALYTICS_SERVICE_URL')) {
    events.push(
      postStep(
        serviceUrl('ACCESS_ANALYTICS_SERVICE_URL'),
        '/analytics/event',
        { jobId, stage, payload },
        requestId
      )
    );
  }

  if (serviceUrl('METRICS_SERVICE_URL')) {
    events.push(
      postStep(
        serviceUrl('METRICS_SERVICE_URL'),
        '/metrics/event',
        { jobId, service: 'webhook-service', stage },
        requestId
      )
    );
  }

  await Promise.allSettled(events);
}

async function processFile(file, requestId) {
  const jobId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const steps = {};

  const preview = await postStep(serviceUrl('PREVIEW_SERVICE_URL'), '/preview', { jobId, file }, requestId);
  steps.preview = preview.status || 'completed';

  const compression = await postStep(
    serviceUrl('COMPRESSION_SERVICE_URL'),
    '/compress',
    { jobId, file, preview },
    requestId
  );
  steps.compression = compression.status || 'completed';

  const backup = await postStep(
    serviceUrl('BACKUP_SERVICE_URL'),
    '/backup',
    { jobId, file, preview, compression },
    requestId
  );
  steps.backup = backup.status || 'completed';

  const notification = await postStep(
    serviceUrl('NOTIFICATION_SERVICE_URL'),
    '/notify',
    { jobId, userId: file.userId, fileName: file.fileName, backup },
    requestId
  );
  steps.notification = notification.status || 'sent';

  await recordSidecarEvents(jobId, 'process-file', file, requestId);
  steps.analytics = 'recorded';

  return {
    job_id: jobId,
    status: 'completed',
    steps
  };
}

module.exports = {
  processFile,
  recordSidecarEvents
};
