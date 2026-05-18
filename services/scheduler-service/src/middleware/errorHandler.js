const logger = require('../config/logger');
const responseHelper = require('../../../../shared/responseHelper');

const errorHandler = (err, req, res, _next) => {
  logger.error('Request failed.', {
    method: req.method,
    path: req.originalUrl,
    error: err.message
  });

  responseHelper.errorResponse(res, err.message || 'Internal Server Error', err.status || 500);
};

module.exports = errorHandler;
