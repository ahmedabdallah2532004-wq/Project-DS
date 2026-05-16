import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { newDb } from 'pg-mem';

const db = newDb();
const { Pool } = db.adapters.createPg();
const pool = new Pool();
const publishThresholdExceeded = vi.fn();

vi.mock('../../src/db/pool.js', () => ({ pool }));
vi.mock('../../src/events/kafka.js', () => ({
  publishThresholdExceeded,
  connectKafka: vi.fn(),
  disconnectKafka: vi.fn()
}));

const { runMigration } = await import('../../src/db/migrate.js');
const { setKafkaConnected } = await import('../../src/events/runtime-state.js');
const { createApp } = await import('../../src/api/app.js');

describe('metrics integration', () => {
  const app = createApp();

  beforeAll(async () => {
    await runMigration(pool);
  });

  beforeEach(async () => {
    publishThresholdExceeded.mockReset();
    setKafkaConnected(true);
    await pool.query('TRUNCATE TABLE metrics RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('stores a metric through the HTTP API', async () => {
    const response = await request(app).post('/metrics').send({
      service: 'gateway',
      name: 'cpu',
      value: 90,
      threshold: 80,
      labels: { node: 'n1' }
    });

    expect(response.status).toBe(201);
    expect(response.body.data.metric.id).toBe(1);
    expect(publishThresholdExceeded).toHaveBeenCalledOnce();
  });

  it('lists recent metrics from the seeded database', async () => {
    await request(app).post('/metrics').send({
      service: 'gateway',
      name: 'memory',
      value: 70,
      threshold: 80,
      labels: {}
    });

    const response = await request(app).get('/metrics/recent');

    expect(response.status).toBe(200);
    expect(response.body.data.metrics).toHaveLength(1);
  });

  it('exposes Prometheus metrics output', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('http_requests_total');
  });
});
