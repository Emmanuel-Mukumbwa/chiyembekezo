const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT id FROM professionals WHERE user_id = ? AND is_verified = 1
    `, [userId]);
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Verified professional required.' });
    }
    req.professionalId = rows[0].id;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};