const logger = require('../config/logger');
const responseHelper = require('../../../../shared/responseHelper');

function notFound(req, res) {
  responseHelper.errorResponse(res, 'Route not found.', 404);
}

function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || (error.type === 'entity.parse.failed' ? 400 : 500);

  logger.error('Request failed.', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: error.message
  });

  responseHelper.errorResponse(res, statusCode === 500 ? 'Internal server error.' : error.message, statusCode);
}

module.exports = {
  notFound,
  errorHandler
};
