import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockListRecentMetrics = vi.fn();
const mockRecordMetric = vi.fn();

vi.mock('../modules/metrics/metrics.service.js', () => ({
  listRecentMetrics: mockListRecentMetrics,
  recordMetric: mockRecordMetric
}));

const { createApp } = await import('../api/app.js');

describe('metrics service HTTP API', () => {
  const app = createApp();

  beforeEach(() => {
    mockListRecentMetrics.mockReset();
    mockRecordMetric.mockReset();
  });

  it('returns liveness status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('validates metric payloads', async () => {
    const response = await request(app).post('/metrics').send({
      service: 'x',
      name: 'cpu'
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates a metric with the standard response envelope', async () => {
    mockRecordMetric.mockResolvedValue({
      id: 1,
      service: 'storage-gateway',
      name: 'cpu',
      value: 95,
      threshold: 80,
      threshold_breached: true,
      labels: { node: 'n1' },
      recorded_at: '2026-04-23T00:00:00.000Z'
    });

    const response = await request(app).post('/metrics').send({
      service: 'storage-gateway',
      name: 'cpu',
      value: 95,
      threshold: 80,
      labels: { node: 'n1' }
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.metric.threshold_breached).toBe(true);
    expect(response.body.meta.service).toBe('metrics-service');
  });
});
