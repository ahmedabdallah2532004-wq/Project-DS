import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestErrorsTotal = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP requests resulting in errors',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Summary({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration summary',
  labelNames: ['method', 'route', 'status_code'],
  percentiles: [0.5, 0.95, 0.99],
  registers: [register]
});

export function observabilityMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const route = req.route?.path ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSeconds);

    if (res.statusCode >= 400) {
      httpRequestErrorsTotal.inc(labels);
    }
  });

  next();
}

export async function metricsHandler(_req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}

export function resetMetricsRegistry() {
  register.resetMetrics();
}
