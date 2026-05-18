const express = require('express');
const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');

const config = require('../config/config');
const swaggerDocument = require('../swagger');

const router = express.Router();
const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'scheduler_service_'
});

const httpRequestsTotal = new client.Counter({
  name: 'scheduler_service_http_requests_total',
  help: 'Total HTTP requests handled by scheduler-service.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'scheduler_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests handled by scheduler-service.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

function metricsMiddleware(req, res, next) {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });

  next();
}

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: config.serviceName });
});

router.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready', service: config.serviceName });
});

router.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));
router.get('/api-docs', (req, res) => res.redirect('/docs'));

module.exports = {
  router,
  metricsMiddleware,
  register
};
