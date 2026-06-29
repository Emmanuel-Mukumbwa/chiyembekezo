const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};