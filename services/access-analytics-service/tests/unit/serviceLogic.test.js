require('../setupEnv');
const serviceLogic = require('../../src/serviceLogic');

describe('access-analytics-service service logic', () => {
  test('accepts object payloads', () => {
    expect(serviceLogic.validatePayload({ ok: true })).toBe(true);
  });
  test('rejects null payload', () => {
    expect(() => serviceLogic.validatePayload(null)).toThrow('Payload must be a JSON object.');
  });
  test('rejects array payload', () => {
    expect(() => serviceLogic.validatePayload([])).toThrow('Payload must be a JSON object.');
  });
  test('summarizes payload keys', () => {
    expect(serviceLogic.summarizePayload({ a: 1, b: 2 }).keys).toEqual(['a', 'b']);
  });
  test('summary includes accepted flag', () => {
    expect(serviceLogic.summarizePayload({}).accepted).toBe(true);
  });
});
