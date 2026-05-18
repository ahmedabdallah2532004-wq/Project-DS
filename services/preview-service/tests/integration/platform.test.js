require('../setupEnv');
const request = require('supertest');
const app = require('../../src/app');

describe('preview-service platform endpoints', () => {
  test('GET /health returns service health', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body).toEqual({ status: 'ok', service: 'preview-service' });
  });
  test('GET /ready returns readiness', async () => {
    const response = await request(app).get('/ready').expect(200);
    expect(response.body).toEqual({ status: 'ready', service: 'preview-service' });
  });
  test('GET /metrics returns Prometheus metrics', async () => {
    const response = await request(app).get('/metrics').expect(200);
    expect(response.text).toContain('preview_service_http_requests_total');
  });
  test('POST process validates payload', async () => {
    const response = await request(app).post('/api/preview-service/process').send([]).expect(400);
    expect(response.body.message).toBe('Payload must be a JSON object.');
  });
  test('POST process handles happy path', async () => {
    const response = await request(app).post('/api/preview-service/process').send({ fileId: 'f1' }).expect(200);
    expect(response.body.service).toBe('preview-service');
  });
});
