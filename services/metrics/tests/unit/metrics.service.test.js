import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockInsertMetric = vi.fn();
const mockPublishThresholdExceeded = vi.fn();
const runtimeState = {
  defaultThreshold: 80,
  alertsEnabled: true,
  kafkaConnected: true
};

vi.mock('../../src/modules/metrics/metrics.repository.js', () => ({
  insertMetric: mockInsertMetric,
  fetchRecentMetrics: vi.fn()
}));

vi.mock('../../src/events/kafka.js', () => ({
  publishThresholdExceeded: mockPublishThresholdExceeded
}));

vi.mock('../../src/events/runtime-state.js', () => ({
  getRuntimeState: () => runtimeState
}));

const { recordMetric } = await import('../../src/modules/metrics/metrics.service.js');

describe('recordMetric', () => {
  beforeEach(() => {
    mockInsertMetric.mockReset();
    mockPublishThresholdExceeded.mockReset();
    runtimeState.defaultThreshold = 80;
    runtimeState.alertsEnabled = true;
  });

  it('publishes when the threshold is breached', async () => {
    mockInsertMetric.mockResolvedValue({
      id: 1,
      service: 'gateway',
      name: 'cpu',
      value: 95,
      threshold: 80,
      labels: {},
      recorded_at: '2026-01-01T00:00:00.000Z'
    });

    const metric = await recordMetric({ service: 'gateway', name: 'cpu', value: 95, labels: {} });

    expect(metric.threshold).toBe(80);
    expect(mockPublishThresholdExceeded).toHaveBeenCalledOnce();
  });

  it('does not publish when alerts are disabled', async () => {
    runtimeState.alertsEnabled = false;
    mockInsertMetric.mockResolvedValue({
      id: 2,
      service: 'gateway',
      name: 'cpu',
      value: 95,
      threshold: 80,
      labels: {},
      recorded_at: '2026-01-01T00:00:00.000Z'
    });

    await recordMetric({ service: 'gateway', name: 'cpu', value: 95, labels: {} });

    expect(mockPublishThresholdExceeded).not.toHaveBeenCalled();
  });
});
