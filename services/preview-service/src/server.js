const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');
const previewConsumer = require('./kafka/previewConsumer');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('preview-service listening.', { port: config.port });
  previewConsumer.start().catch(err => {
    logger.error('Failed to start Kafka consumer', { error: err.message });
  });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  await previewConsumer.stop();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
