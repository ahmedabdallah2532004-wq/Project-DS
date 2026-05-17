require('dotenv').config();

module.exports = {
  serviceName: process.env.SERVICE_NAME,
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,
  mongoRetryConnectionDelayMs: Number(process.env.MONGO_RETRY_CONNECTION_DELAY_MS),
  cronInterval: process.env.CRON_INTERVAL,
  retryLimits: Number(process.env.RETRY_LIMITS),
  kafkaTopic: process.env.KAFKA_TOPIC,
  jobTimeout: Number(process.env.JOB_TIMEOUT_MS),
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKER ? [process.env.KAFKA_BROKER] : [],
  }
};
