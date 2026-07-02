const logger = require('../utils/logger');

const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
  });
  // Pass error to the next error handler (or send response)
  next(err);
};

module.exports = errorLogger;