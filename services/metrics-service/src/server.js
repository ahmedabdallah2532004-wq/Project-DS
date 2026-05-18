const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');
const metricsProducer = require('./kafka/metricsProducer');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('metrics-service listening.', { port: config.port });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  await metricsProducer.disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
