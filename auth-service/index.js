require('./src/tracing');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
});
