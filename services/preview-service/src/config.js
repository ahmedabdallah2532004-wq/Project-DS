require('dotenv').config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  serviceName: process.env.SERVICE_NAME || 'preview-service',
  port: toNumber(process.env.PORT, 3003)
};
