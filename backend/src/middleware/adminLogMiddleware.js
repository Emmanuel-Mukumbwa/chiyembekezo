// backend/src/middleware/adminLogMiddleware.js
const { logAdminAction } = require('../services/adminLogService');

const adminLogMiddleware = (req, res, next) => {
  // Store start time and original end to capture status
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (chunk, encoding) {
    originalEnd.call(this, chunk, encoding);
    // Only log if status is 2xx (success) or 4xx/5xx (errors) – you decide
    const status = res.statusCode;
    if (status >= 200 && status < 300) {
      const adminUserId = req.user?.id; // from auth middleware
      if (adminUserId) {
        logAdminAction(
          adminUserId,
          `${req.method} ${req.originalUrl}`,
          'route',
          null,
          {
            status,
            query: req.query,
            body: req.body,
            ip: req.ip,
          }
        ).catch(console.error);
      }
    }
  };

  next();
};

module.exports = adminLogMiddleware;