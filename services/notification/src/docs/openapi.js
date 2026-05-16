export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Notification Service API',
    version: '1.0.0',
    description: 'REST, observability, and health endpoints for the notification service.'
  },
  servers: [{ url: '/' }],
  paths: {
    '/health': {
      get: {
        summary: 'Liveness probe',
        responses: {
          200: { description: 'Service is alive' }
        }
      }
    },
    '/ready': {
      get: {
        summary: 'Readiness probe',
        responses: {
          200: { description: 'Dependencies are ready' },
          503: { description: 'Dependencies are not ready' }
        }
      }
    },
    '/metrics': {
      get: {
        summary: 'Prometheus metrics endpoint',
        responses: {
          200: { description: 'Prometheus metrics output' }
        }
      }
    },
    '/notify/email': {
      post: {
        summary: 'Create and dispatch a manual notification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'to_address', 'subject', 'message'],
                properties: {
                  type: { type: 'string' },
                  to_address: { type: 'string', format: 'email' },
                  subject: { type: 'string' },
                  message: { type: 'string' },
                  metadata: { type: 'object', additionalProperties: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Notification sent' },
          422: { description: 'Validation error' },
          500: { description: 'Notification send failure' }
        }
      }
    },
    '/notifications': {
      get: {
        summary: 'List recent notifications',
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100 }
          }
        ],
        responses: {
          200: { description: 'Recent notifications list' }
        }
      }
    }
  }
};
