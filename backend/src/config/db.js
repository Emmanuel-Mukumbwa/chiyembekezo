const mysql = require('mysql2/promise');

// Parse SSL certificate if provided
const parseSSL = () => {
  if (!process.env.DB_SSL_CA) return null;
  
  try {
    // Remove surrounding quotes if present
    let cert = process.env.DB_SSL_CA.replace(/^"|"$/g, '');
    
    // Replace literal \n with actual newlines
    cert = cert.replace(/\\n/g, '\n');
    
    return {
      ca: cert,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
  } catch (error) {
    console.warn('Failed to parse SSL certificate:', error.message);
    return null;
  }
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chiyembekezo',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  // SSL configuration
  ssl: parseSSL(),
  // Enable keep-alive for cloud connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;