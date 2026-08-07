const { logAdminAction } = require('../services/adminLogService');

const adminLogMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (chunk, encoding) {
    originalEnd.call(this, chunk, encoding);
    const status = res.statusCode;
    if (status >= 200 && status < 300) {
      const adminUserId = req.user?.id;
      const adminEmail = req.user?.email;
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
          },
          adminEmail
        ).catch(console.error);
      }
    }
  };
  next();
};

module.exports = adminLogMiddleware;
