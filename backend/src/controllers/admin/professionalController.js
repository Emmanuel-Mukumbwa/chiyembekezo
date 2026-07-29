const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getProfessionals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, u.email, u.first_name, u.last_name, p.specialization, p.district,
             p.is_verified, p.created_at
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    await pool.query('UPDATE professionals SET is_verified = ? WHERE id = ?', [is_verified, id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Verified professional ${id}`, 'professional', id, { is_verified });
    res.json({ message: 'Professional updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
// DELETE professional
exports.deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    // First get the user_id from professionals
    const [rows] = await pool.query('SELECT user_id FROM professionals WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Professional not found' });
    const userId = rows[0].user_id;
    // Delete from professionals
    await pool.query('DELETE FROM professionals WHERE id = ?', [id]);
    // Optionally delete user account? We'll just set role to 'user'
    await pool.query('UPDATE users SET role = "user", is_professional = 0 WHERE id = ?', [userId]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Deleted professional ${id}`, 'professional', id);
    res.json({ message: 'Professional deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
