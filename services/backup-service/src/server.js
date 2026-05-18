const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');
const backupConsumer = require('./kafka/backupConsumer');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('backup-service listening.', { port: config.port });
  backupConsumer.start().catch(err => {
    logger.error('Failed to start Kafka consumer', { error: err.message });
  });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  await backupConsumer.stop();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
