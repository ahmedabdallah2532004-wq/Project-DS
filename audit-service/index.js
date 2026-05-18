require('./src/tracing');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  logger.info(`Audit Service running on port ${PORT}`);
});
