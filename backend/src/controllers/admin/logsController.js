const pool = require('../../config/db');

exports.getLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, search, actor_type, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(action LIKE ? OR target_type LIKE ? OR actor_email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (actor_type) {
      conditions.push('actor_type = ?');
      params.push(actor_type);
    }
    if (start_date) {
      conditions.push('created_at >= ?');
      params.push(start_date + ' 00:00:00');
    }
    if (end_date) {
      conditions.push('created_at <= ?');
      params.push(end_date + ' 23:59:59');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(`
      SELECT id, admin_user_id, actor_type, actor_email, action, target_type, target_id, details, created_at
      FROM admin_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM admin_logs ${where}`,
      params
    );

    res.json({ logs: rows, total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
