const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Query the user_organizations junction table
    const [rows] = await pool.query(`
      SELECT o.id, o.name, uo.role as org_role
      FROM user_organizations uo
      JOIN organizations o ON uo.organization_id = o.id
      WHERE uo.user_id = ? AND uo.role = 'admin'
    `, [userId]);
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Organization admin required.' });
    }
    // Attach organization info to request
    req.organization = {
      id: rows[0].id,
      name: rows[0].name,
      orgRole: rows[0].org_role,
    };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};