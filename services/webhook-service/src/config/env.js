require('dotenv').config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'y', 'on'].includes(String(value).toLowerCase());
}

function toList(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

module.exports = {
  serviceName: process.env.SERVICE_NAME,
  port: toNumber(process.env.PORT),
  apiKey: process.env.API_KEY,
  mongoUri: process.env.MONGO_URI,
  database: {
    retryConnectionDelayMs: toNumber(process.env.MONGO_RETRY_CONNECTION_DELAY_MS)
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    groupId: process.env.KAFKA_GROUP_ID,
    brokers: toList(process.env.KAFKA_BROKERS),
    topic: process.env.KAFKA_TOPIC,
    statusTopic: process.env.KAFKA_STATUS_TOPIC,
    deadLetterTopic: process.env.KAFKA_DEAD_LETTER_TOPIC,
    retryConnectionDelayMs: toNumber(process.env.KAFKA_RETRY_CONNECTION_DELAY_MS)
  },
  webhook: {
    timeoutMs: toNumber(process.env.HTTP_TIMEOUT_MS),
    retryCount: toNumber(process.env.WEBHOOK_RETRY_COUNT),
    retryDelayMs: toNumber(process.env.WEBHOOK_RETRY_DELAY_MS)
  },
  seed: {
    enabled: toBoolean(process.env.ENABLE_SAMPLE_WEBHOOK_SEED, false),
    url: process.env.SAMPLE_WEBHOOK_URL,
    name: process.env.SAMPLE_WEBHOOK_NAME
  }
};
