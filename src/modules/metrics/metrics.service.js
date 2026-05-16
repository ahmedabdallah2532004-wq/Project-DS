import { env } from '../../config/env.js';
import { publishThresholdExceeded } from '../../events/kafka.js';
import { getRuntimeState } from '../../events/runtime-state.js';
import { insertMetric, fetchRecentMetrics } from './metrics.repository.js';

export async function recordMetric(input) {
  const runtimeState = getRuntimeState();
  const effectiveThreshold = input.threshold ?? runtimeState.defaultThreshold ?? env.DEFAULT_THRESHOLD;
  const thresholdBreached = input.value >= effectiveThreshold;

  const metric = await insertMetric({
    ...input,
    threshold: effectiveThreshold,
    thresholdBreached
  });

  if (thresholdBreached && runtimeState.alertsEnabled) {
    await publishThresholdExceeded({
      metric_id: metric.id,
      service: metric.service,
      name: metric.name,
      value: metric.value,
      threshold: metric.threshold,
      labels: metric.labels,
      recorded_at: metric.recorded_at
    });
  }

  return metric;
}

export async function listRecentMetrics(limit) {
  return fetchRecentMetrics(limit);
}
