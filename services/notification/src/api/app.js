import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '../docs/openapi.js';
import { errorResponse, requestContext } from '../lib/http.js';
import { notificationRouter } from '../modules/notifications/notification.routes.js';
import { systemRouter } from '../modules/system/system.routes.js';
import { metricsHandler, observabilityMiddleware } from '../observability/metrics.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(requestContext);
  app.use(observabilityMiddleware);

  app.use(systemRouter);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/metrics', metricsHandler);
  app.use(notificationRouter);

  app.use((req, res) => {
    const response = errorResponse(req, 'NOT_FOUND', 'Route not found', {}, 404);
    res.status(response.statusCode).json(response.body);
  });

  app.use((error, req, res, next) => {
    req.log.error({ err: error }, 'Unhandled application error');
    const response = errorResponse(req, 'INTERNAL_SERVER_ERROR', 'Unexpected server error', {}, 500);
    res.status(response.statusCode).json(response.body);
    next();
  });

  return app;
}
