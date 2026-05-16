export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Metrics Service API',
    version: '1.0.0',
    description: 'REST, observability, and health endpoints for the metrics service.'
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
      },
      post: {
        summary: 'Create a metric record',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['service', 'name', 'value'],
                properties: {
                  service: { type: 'string' },
                  name: { type: 'string' },
                  value: { type: 'number' },
                  threshold: { type: 'number' },
                  labels: { type: 'object', additionalProperties: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Metric stored' },
          422: { description: 'Validation error' },
          500: { description: 'Storage failure' }
        }
      }
    },
    '/metrics/recent': {
      get: {
        summary: 'List recent metrics',
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100 }
          }
        ],
        responses: {
          200: { description: 'Recent metrics list' }
        }
      }
    }
  }
};
