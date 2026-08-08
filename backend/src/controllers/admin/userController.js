const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getUsers = async (req, res) => {
  try {
    const { limit = 50, page = 1, search } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE is_admin = 0'; // Exclude admin users
    const params = [];
    if (search) {
      where += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, phone, is_active, is_admin, is_professional, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    res.json({ users: rows, total: countResult[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, is_admin, is_professional } = req.body;
    // Prevent setting is_admin = 1 via this endpoint (only admins can be created manually)
    if (is_admin === 1) {
      return res.status(403).json({ error: 'Cannot grant admin privileges via this endpoint.' });
    }
    await pool.query(
      'UPDATE users SET is_active = ?, is_admin = ?, is_professional = ? WHERE id = ?',
      [is_active, is_admin, is_professional, id]
    );
    await logAuditAction(
      req.user.id,
      `Updated user ${id}`,
      'user',
      id,
      { is_active, is_admin, is_professional },
      req.user.email
    );
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deleting admin users
    const [rows] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].is_admin === 1) {
      return res.status(403).json({ error: 'Cannot delete admin users.' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await logAuditAction(
      req.user.id,
      `Deleted user ${id}`,
      'user',
      id,
      {},
      req.user.email
    );
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
