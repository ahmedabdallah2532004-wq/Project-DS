const request = require('supertest');
const app = require('../../src/app');

describe('Auth API Integration Tests', () => {
  test('POST /login should return 200 for valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBe('fake-jwt-token');
  });

  test('GET /verify should return 200 for valid token', async () => {
    const response = await request(app)
      .get('/verify')
      .set('Authorization', 'fake-jwt-token');
    
    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
  });
});
