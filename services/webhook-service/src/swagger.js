module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Webhook Service API',
    version: '1.0.0'
  },
  paths: {
    '/health': {
      get: {
        summary: 'Liveness health check',
        responses: { 200: { description: 'Service is alive' } }
      }
    },
    '/ready': {
      get: {
        summary: 'Readiness check',
        responses: { 200: { description: 'Service is ready' } }
      }
    },
    '/metrics': {
      get: {
        summary: 'Prometheus metrics',
        responses: { 200: { description: 'Prometheus metrics text output' } }
      }
    },
    '/docs': {
      get: {
        summary: 'Swagger UI',
        responses: { 200: { description: 'Interactive API documentation' } }
      }
    },
    '/api-docs': {
      get: {
        summary: 'Swagger UI redirect',
        responses: { 302: { description: 'Redirects to /docs' } }
      }
    },
    '/process-file': {
      post: {
        summary: 'Run full PM3 file processing flow',
        responses: {
          200: { description: 'Flow completed' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/webhooks': {
      get: {
        summary: 'List registered webhooks',
        responses: { 200: { description: 'Webhook list' } }
      },
      post: {
        summary: 'Register a webhook',
        responses: {
          201: { description: 'Webhook created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/webhook-logs': {
      get: {
        summary: 'List webhook delivery logs',
        responses: { 200: { description: 'Delivery logs' } }
      }
    },
    '/test-webhook': {
      post: {
        summary: 'Manually dispatch a test webhook event',
        responses: {
          200: { description: 'Test event processed' },
          400: { description: 'Validation error' }
        }
      }
    }
  }
};
