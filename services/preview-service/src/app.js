const express = require('express');
const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const logger = require('./logger');
const { requestContext } = require('./requestContext');
const swaggerDocument = require('./swagger');
const serviceLogic = require('./serviceLogic');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'preview_service_' });
const httpRequestsTotal = new client.Counter({
  name: 'preview_service_http_requests_total',
  help: 'Total HTTP requests.',
  labelNames: ['method', 'path', 'status_code'],
  registers: [register]
});

app.use(requestContext);
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  logger.info('Incoming request.', { method: req.method, path: req.originalUrl });
  res.on('finish', () => httpRequestsTotal.inc({ method: req.method, path: req.route?.path || req.path, status_code: String(res.statusCode) }));
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
app.post('/api/preview-service/process', (req, res, next) => {
  try {
    serviceLogic.validatePayload(req.body);
    res.status(200).json({ service: config.serviceName, data: serviceLogic.summarizePayload(req.body) });
  } catch (error) {
    next(error);
  }
});
app.use((req, res) => res.status(404).json({ message: 'Route not found.', path: req.originalUrl }));
app.use((error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  logger.error('Request failed.', { method: req.method, path: req.originalUrl, statusCode, error: error.message });
  res.status(statusCode).json({ message: statusCode === 500 ? 'Internal server error.' : error.message });
});

module.exports = app;
