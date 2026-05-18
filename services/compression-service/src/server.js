const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');
const compressionConsumer = require('./kafka/compressionConsumer');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('compression-service listening.', { port: config.port });
  compressionConsumer.start().catch(err => {
    logger.error('Failed to start Kafka consumer', { error: err.message });
  });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  await compressionConsumer.stop();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
