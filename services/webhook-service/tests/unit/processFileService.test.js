jest.mock('axios');

const axios = require('axios');
const { processFile } = require('../../src/services/processFileService');

describe('process file service', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.post.mockResolvedValue({ data: { status: 'completed' } });
  });

  test('calls preview, compression, backup and notification services', async () => {
    const result = await processFile({ fileName: 'sample.pdf', fileType: 'pdf', userId: 'user-1' }, 'req-1');

    expect(result.status).toBe('completed');
    expect(result.steps.preview).toBe('completed');
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/preview'), expect.any(Object), expect.any(Object));
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/compress'), expect.any(Object), expect.any(Object));
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/backup'), expect.any(Object), expect.any(Object));
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/notify'), expect.any(Object), expect.any(Object));
  });
});
