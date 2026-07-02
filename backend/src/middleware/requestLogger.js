const logger = require('../utils/logger');

const sanitizeBody = (body) => {
  if (!body) return body;
  const sanitized = { ...body };
  ['password', 'newPassword', 'confirmPassword', 'token', 'resetToken'].forEach(field => {
    if (sanitized[field]) sanitized[field] = '***';
  });
  return sanitized;
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  let responseBody = null;

  res.end = function (chunk, encoding) {
    responseBody = chunk;
    originalEnd.call(this, chunk, encoding);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown',
      query: req.query,
      body: sanitizeBody(req.body),
      headers: {
        'content-type': req.get('content-type'),
        'referer': req.get('referer'),
      },
    };

    logger.log({
      level: logLevel,
      message: `${req.method} ${req.originalUrl || req.url}`,
      ...logData,
    });
  });

  next();
};

module.exports = requestLogger;