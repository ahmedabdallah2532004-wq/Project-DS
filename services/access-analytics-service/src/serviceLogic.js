function summarizePayload(payload = {}) {
  return {
    accepted: true,
    keys: Object.keys(payload),
    receivedAt: new Date().toISOString()
  };
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    const error = new Error('Payload must be a JSON object.');
    error.statusCode = 400;
    throw error;
  }
  return true;
}

module.exports = { summarizePayload, validatePayload };
