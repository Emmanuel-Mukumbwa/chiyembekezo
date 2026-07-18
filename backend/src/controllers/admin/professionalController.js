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