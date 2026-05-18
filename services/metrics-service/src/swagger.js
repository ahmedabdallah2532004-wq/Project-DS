module.exports = {
  openapi: '3.0.3',
  info: { title: 'Metrics Service API', version: '1.0.0' },
  paths: {
    '/health': { get: { summary: 'Liveness check', responses: { 200: { description: 'OK' } } } },
    '/ready': { get: { summary: 'Readiness check', responses: { 200: { description: 'Ready' } } } },
    '/metrics': { get: { summary: 'Prometheus metrics', responses: { 200: { description: 'Metrics' } } } },
    '/api/metrics-service/process': {
      post: {
        summary: 'Process service payload',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fileId: { type: 'string', example: 'f1' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
