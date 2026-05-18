const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/utils/logger');

jest.mock('../../src/utils/logger');

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /login should return 200 for valid credentials (Happy Path)', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBe('fake-jwt-token');
  });

  test('POST /login should return 401 for invalid credentials (Validation Error)', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'wrong', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('GET /verify should return 200 for valid token (Happy Path)', async () => {
    const response = await request(app)
      .get('/verify')
      .set('Authorization', 'fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
  });

  test('GET /verify should return 401 for invalid token (Edge Case)', async () => {
    const response = await request(app)
      .get('/verify')
      .set('Authorization', 'wrong-token');

    expect(response.status).toBe(401);
    expect(response.body.valid).toBe(false);
  });

  test('GET /health should return UP', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});
