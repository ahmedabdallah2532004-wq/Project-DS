const successResponse = (res, data, message = 'Success', status = 200) => {
  const service = process.env.SERVICE_NAME || 'unknown-service';
  const requestId = res.req ? res.req.requestId : 'unknown-request';
  
  return res.status(status).json({
    success: true,
    message,
    data,
    meta: {
      service,
      request_id: requestId,
      timestamp: new Date().toISOString()
    }
  });
};

const errorResponse = (res, message = 'Error', status = 500, errors = null) => {
  const service = process.env.SERVICE_NAME || 'unknown-service';
  const requestId = res.req ? res.req.requestId : 'unknown-request';

  return res.status(status).json({
    success: false,
    message,
    errors,
    meta: {
      service,
      request_id: requestId,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  successResponse,
  errorResponse
};
