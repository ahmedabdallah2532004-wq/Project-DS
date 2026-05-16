import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { newDb } from 'pg-mem';

const db = newDb();
const { Pool } = db.adapters.createPg();
const pool = new Pool();
const publishNotificationSent = vi.fn();

vi.mock('../../src/db/pool.js', () => ({ pool }));
vi.mock('../../src/events/kafka.js', () => ({
  publishNotificationSent,
  connectKafka: vi.fn(),
  disconnectKafka: vi.fn()
}));

const { runMigration } = await import('../../src/db/migrate.js');
const { setKafkaConnected } = await import('../../src/events/runtime-state.js');
const { createApp } = await import('../../src/api/app.js');

describe('notification integration', () => {
  const app = createApp();

  beforeAll(async () => {
    await runMigration(pool);
  });

  beforeEach(async () => {
    publishNotificationSent.mockReset();
    setKafkaConnected(true);
    await pool.query('TRUNCATE TABLE notifications RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('stores manual notifications through the HTTP API', async () => {
    const response = await request(app).post('/notify/email').send({
      type: 'manual',
      to_address: 'ops@example.com',
      subject: 'Alert',
      message: 'Triggered manually',
      metadata: { source: 'admin' }
    });

    expect(response.status).toBe(201);
    expect(response.body.data.notification.id).toBe(1);
    expect(publishNotificationSent).toHaveBeenCalledOnce();
  });

  it('lists recent notifications from the seeded database', async () => {
    await request(app).post('/notify/email').send({
      type: 'manual',
      to_address: 'ops@example.com',
      subject: 'Alert',
      message: 'Triggered manually',
      metadata: {}
    });

    const response = await request(app).get('/notifications');

    expect(response.status).toBe(200);
    expect(response.body.data.notifications).toHaveLength(1);
  });

  it('exposes Prometheus metrics output', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('http_requests_total');
  });
});
