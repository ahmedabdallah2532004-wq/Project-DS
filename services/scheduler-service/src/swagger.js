module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Scheduler Service API',
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
    '/jobs/run': {
      post: {
        summary: 'Run PM3 scheduled platform job',
        responses: { 200: { description: 'Job completed' } }
      }
    },
    '/jobs/status': {
      get: {
        summary: 'Get PM3 scheduled job status',
        responses: { 200: { description: 'Scheduled job status' } }
      }
    },
    '/create-job': {
      post: {
        summary: 'Create a scheduled job',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'backup-job' },
                  schedule: { type: 'string', example: '0 0 * * *' },
                  action: { type: 'string', example: 'backup' }
                },
                required: ['name', 'schedule', 'action']
              }
            }
          }
        },
        responses: {
          201: { description: 'Job created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/run-job': {
      post: {
        summary: 'Run a job immediately',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  jobId: { type: 'string', example: 'job-1' }
                },
                required: ['jobId']
              }
            }
          }
        },
        responses: {
          200: { description: 'Job execution started' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/jobs': {
      get: {
        summary: 'List all jobs',
        responses: { 200: { description: 'Job list' } }
      }
    }
  }
};
