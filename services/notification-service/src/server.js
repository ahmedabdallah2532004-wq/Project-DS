const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');
const notificationConsumer = require('./kafka/notificationConsumer');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('notification-service listening.', { port: config.port });
  notificationConsumer.start().catch(err => {
    logger.error('Failed to start Kafka consumer', { error: err.message });
  });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  await notificationConsumer.stop();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
