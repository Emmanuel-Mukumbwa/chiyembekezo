const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getVolunteers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.id, u.email, u.first_name, u.last_name, v.is_verified, v.is_online,
             v.bio, v.created_at
      FROM volunteer_listeners v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    await pool.query('UPDATE volunteer_listeners SET is_verified = ? WHERE id = ?', [is_verified, id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Verified volunteer ${id}`, 'volunteer', id, { is_verified });
    res.json({ message: 'Volunteer updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};