const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.warn('🔑 Auth: No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`🔑 Auth: Token decoded for user ${decoded.id}`);

    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      console.warn(`🔑 Auth: User ${decoded.id} not found in database`);
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: decoded.id };
    console.log(`✅ Auth: User ${decoded.id} authenticated`);
    next();
  } catch (err) {
    console.error('🔑 Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};