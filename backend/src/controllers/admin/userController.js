const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getUsers = async (req, res) => {
  try {
    const { limit = 50, page = 1, search } = req.query;
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (search) {
      where = 'WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
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
    await pool.query(
      'UPDATE users SET is_active = ?, is_admin = ?, is_professional = ? WHERE id = ?',
      [is_active, is_admin, is_professional, id]
    );
    await logAuditAction(req.user.id, 'admin', req.user.email, `Updated user ${id}`, 'user', id, { is_active, is_admin, is_professional });
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Deleted user ${id}`, 'user', id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};