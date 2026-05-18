const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/utils/logger');

jest.mock('../../src/utils/logger');

describe('Audit Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /audit/log should create a log (Happy Path)', async () => {
    const logData = { service: 'test', action: 'test-action' };
    const response = await request(app)
      .post('/audit/log')
      .send(logData);

    expect(response.status).toBe(201);
    expect(response.body.service).toBe('test');
    expect(response.body.id).toBeDefined();
  });

  test('GET /audit/logs should return all logs', async () => {
    await request(app).post('/audit/log').send({ service: 's1' });
    const response = await request(app).get('/audit/logs');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  test('GET /ready should return 200', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
  });

  test('POST /audit/log should handle missing fields (Edge Case)', async () => {
    const response = await request(app)
      .post('/audit/log')
      .send({}); // Empty body

    expect(response.status).toBe(201);
  });
});
