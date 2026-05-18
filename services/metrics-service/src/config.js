require('dotenv').config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  serviceName: process.env.SERVICE_NAME || 'metrics-service',
  port: toNumber(process.env.PORT, 3001),
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'metrics-service',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
    groupId: process.env.KAFKA_GROUP_ID || 'metrics-service-group',
    retryConnectionDelayMs: toNumber(process.env.KAFKA_RETRY_CONNECTION_DELAY_MS, 5000)
  }
};
