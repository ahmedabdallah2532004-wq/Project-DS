jest.mock('axios');
jest.mock('../../src/services/webhookRegistryService', () => ({
  listWebhooks: jest.fn().mockResolvedValue([]),
  createWebhook: jest.fn().mockResolvedValue({ id: 'webhook-1' }),
  listLogs: jest.fn().mockResolvedValue([])
}));

jest.mock('../../src/services/webhookService', () => ({
  processEvent: jest.fn().mockResolvedValue({ eventId: 'evt-1', matchedWebhooks: 0 })
}));

const axios = require('axios');
const request = require('supertest');
const app = require('../../src/app');

describe('full file processing flow', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.post.mockResolvedValue({ data: { status: 'completed' } });
  });

  test('POST /process-file returns completed PM3 flow', async () => {
    const response = await request(app)
      .post('/process-file')
      .send({ fileName: 'sample.pdf', fileType: 'pdf', userId: 'user-1' })
      .expect(200);

    expect(response.body.status).toBe('completed');
    expect(response.body.job_id).toBeTruthy();
    expect(response.body.steps).toMatchObject({
      preview: 'completed',
      compression: 'completed',
      backup: 'completed',
      notification: 'completed',
      analytics: 'recorded'
    });
  });

  test('POST /process-file validates payload', async () => {
    const response = await request(app).post('/process-file').send({ fileName: 'sample.pdf' }).expect(400);

    expect(response.body.message).toBe('fileName, fileType and userId are required.');
  });
});
