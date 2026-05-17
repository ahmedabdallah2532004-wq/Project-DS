const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startTracing, shutdownTracing } = require('./tracing');

startTracing();

const server = app.listen(config.port, () => {
  logger.info('access-analytics-service listening.', { port: config.port });
});

async function shutdown(signal) {
  logger.info('Shutting down service.', { signal });
  await shutdownTracing();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
