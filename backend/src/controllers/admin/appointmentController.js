const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getAppointments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.scheduled_time, a.status, a.meeting_type,
             u.email as user_email, p.specialization,
             prof.first_name as professional_first, prof.last_name as professional_last,
             a.created_at
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN professionals p ON a.professional_id = p.id
      JOIN users prof ON p.user_id = prof.id
      ORDER BY a.scheduled_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Updated appointment ${id} status to ${status}`, 'appointment', id, { status });
    res.json({ message: 'Appointment updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};