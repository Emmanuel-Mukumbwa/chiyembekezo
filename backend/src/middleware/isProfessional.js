const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0 || rows[0].role !== 'professional') {
      return res.status(403).json({ error: 'Access denied. Professional only.' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};