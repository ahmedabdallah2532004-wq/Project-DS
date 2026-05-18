require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { register, httpRequestDurationMicroseconds, httpRequestsTotal, httpErrorsTotal } = require('./utils/metrics');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'API for authentication and session verification',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3006}` }],
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
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    logger.info('User logged in', { username });
    return res.status(200).json({ success: true, token: 'fake-jwt-token' });
  }
  logger.warn('Failed login attempt', { username });
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

/**
 * @openapi
 * /verify:
 *   get:
 *     summary: Verify a token
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Token invalid
 */
app.get('/verify', (req, res) => {
  const token = req.headers.authorization;
  if (token === 'fake-jwt-token') {
    return res.status(200).json({ valid: true });
  }
  res.status(401).json({ valid: false });
});

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'READY' }));

module.exports = app;
