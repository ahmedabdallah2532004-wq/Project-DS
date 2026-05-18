const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');
const analyticsConsumer = require('./kafka/analyticsConsumer');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('access-analytics-service listening.', { port: config.port });
  analyticsConsumer.start().catch(err => {
    logger.error('Failed to start Kafka consumer', { error: err.message });
  });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  await analyticsConsumer.stop();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
