require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { register, httpRequestDurationMicroseconds, httpRequestsTotal, httpErrorsTotal } = require('./utils/metrics');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const auditLogs = [];

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Audit Service API',
      version: '1.0.0',
      description: 'API for logging system audits',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3007}` }],
  },
  apis: ['./src/app.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Metrics & Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const path = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, path, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, path, res.statusCode)
      .inc();

    if (res.statusCode >= 400) {
      httpErrorsTotal
        .labels(req.method, path, res.statusCode)
        .inc();
    }
    
    logger.info(`Request processed`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: duration,
      request_id: requestId
    });
  });
  next();
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/**
 * @openapi
 * /audit/log:
 *   post:
 *     summary: Log an audit event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service: { type: string }
 *               action: { type: string }
 *               details: { type: object }
 *     responses:
 *       201:
 *         description: Audit log created
 */
app.post('/audit/log', (req, res) => {
  const log = { id: uuidv4(), timestamp: new Date(), ...req.body };
  auditLogs.push(log);
  logger.info('Audit log created', { log_id: log.id });
  res.status(201).json(log);
});

/**
 * @openapi
 * /audit/logs:
 *   get:
 *     summary: Get all audit logs
 *     responses:
 *       200:
 *         description: List of audit logs
 */
app.get('/audit/logs', (req, res) => {
  res.status(200).json(auditLogs);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'READY' }));

module.exports = app;
