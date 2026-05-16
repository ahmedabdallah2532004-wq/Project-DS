import { errorResponse, successResponse } from '../../lib/http.js';
import { listRecentMetrics, recordMetric } from './metrics.service.js';
import { recordMetricSchema } from './metrics.schema.js';

export async function createMetric(req, res) {
  const parsed = recordMetricSchema.safeParse(req.body);

  if (!parsed.success) {
    const response = errorResponse(
      req,
      'VALIDATION_ERROR',
      'Metric payload validation failed',
      parsed.error.flatten(),
      422
    );
    return res.status(response.statusCode).json(response.body);
  }

  try {
    const metric = await recordMetric(parsed.data);
    const response = successResponse(req, { metric }, 201);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    req.log.error({ err: error }, 'Failed to create metric');
    const response = errorResponse(req, 'METRIC_WRITE_FAILED', 'Failed to store metric', {}, 500);
    return res.status(response.statusCode).json(response.body);
  }
}

export async function getRecentMetrics(req, res) {
  try {
    const limit = Number(req.query.limit ?? 20);
    const metrics = await listRecentMetrics(limit);
    const response = successResponse(req, { metrics });
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    req.log.error({ err: error }, 'Failed to fetch metrics');
    const response = errorResponse(req, 'METRIC_READ_FAILED', 'Failed to fetch metrics', {}, 500);
    return res.status(response.statusCode).json(response.body);
  }
}
