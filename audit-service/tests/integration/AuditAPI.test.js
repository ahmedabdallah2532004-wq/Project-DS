const request = require('supertest');
const app = require('../../src/app');

describe('Audit API Integration Tests', () => {
  test('POST /audit/log should return 201', async () => {
    const response = await request(app)
      .post('/audit/log')
      .send({ service: 'test', action: 'test' });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  test('GET /audit/logs should return logs', async () => {
    const response = await request(app).get('/audit/logs');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
