//src/controllers/admin/logsController.js
const pool = require('../../config/db');

exports.getLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, search } = req.query;
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (search) {
      where = 'WHERE action LIKE ? OR target_type LIKE ? OR actor_email LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(`
      SELECT id, admin_user_id, actor_email, action, target_type, target_id, details, created_at
      FROM admin_logs
      ${where} 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM admin_logs ${where}`, params);
    res.json({ logs: rows, total: countResult[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
