const express = require('express');
const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const logger = require('./logger');
const { requestContext } = require('./requestContext');
const swaggerDocument = require('./swagger');
const serviceLogic = require('./serviceLogic');
const responseHelper = require('../../../shared/responseHelper');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'notification_service_' });
const httpRequestsTotal = new client.Counter({
  name: 'notification_service_http_requests_total',
  help: 'Total HTTP requests.',
  labelNames: ['method', 'path', 'status_code'],
  registers: [register]
});
const httpRequestDuration = new client.Histogram({
  name: 'notification_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds.',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

app.use(requestContext);
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const start = process.hrtime();
  logger.info('Incoming request.', { method: req.method, path: req.originalUrl });
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const path = req.route?.path || req.path;
    const labels = { method: req.method, path, status_code: String(res.statusCode) };
    
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });
  next();
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: config.serviceName }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'ready', service: config.serviceName }));
app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerDocument));
app.get('/api-docs', (req, res) => res.redirect('/docs'));
app.post('/api/notification-service/process', (req, res, next) => {
  try {
    serviceLogic.validatePayload(req.body);
    responseHelper.successResponse(res, serviceLogic.summarizePayload(req.body), 'Payload processed successfully');
  } catch (error) {
    next(error);
  }
});
app.use((req, res) => responseHelper.errorResponse(res, 'Route not found.', 404));
app.use((error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  logger.error('Request failed.', { method: req.method, path: req.originalUrl, statusCode, error: error.message });
  responseHelper.errorResponse(res, statusCode === 500 ? 'Internal server error.' : error.message, statusCode);
});

module.exports = app;
