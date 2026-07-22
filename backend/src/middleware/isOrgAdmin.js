const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT o.id, o.name, uo.role
      FROM user_organizations uo
      JOIN organizations o ON uo.organization_id = o.id
      WHERE uo.user_id = ? AND uo.role = 'admin'
    `, [userId]);
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Organization admin required.' });
    }
    req.organization = rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};