const winston = require('winston');
const path = require('path');

// Define JSON format for files
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format – detailed multiline output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, method, url, status, duration, ip, userAgent, query, body, headers } = info;
    let output = `[${timestamp}] ${level}: ${message}`;
    if (method) output += `\n  Method: ${method}`;
    if (url) output += `\n  URL: ${url}`;
    if (status) output += `\n  Status: ${status}`;
    if (duration) output += `\n  Duration: ${duration}`;
    if (ip) output += `\n  IP: ${ip}`;
    if (userAgent) output += `\n  User-Agent: ${userAgent}`;
    if (query && Object.keys(query).length) output += `\n  Query: ${JSON.stringify(query)}`;
    if (body && Object.keys(body).length) output += `\n  Body: ${JSON.stringify(body)}`;
    if (headers && Object.keys(headers).length) output += `\n  Headers: ${JSON.stringify(headers)}`;
    return output;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: jsonFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      format: jsonFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      format: jsonFormat,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;