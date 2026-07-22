const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getUpcoming = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const [rows] = await pool.query(`
      SELECT a.id, a.scheduled_time, a.duration_minutes, a.status, a.meeting_type,
             a.meeting_link, a.notes, u.id as user_id, u.email, u.first_name, u.last_name, u.phone
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.professional_id = ? AND a.scheduled_time > NOW() AND a.status IN ('pending', 'confirmed')
      ORDER BY a.scheduled_time ASC
    `, [professionalId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPast = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const [rows] = await pool.query(`
      SELECT a.id, a.scheduled_time, a.duration_minutes, a.status, a.meeting_type,
             a.rating, a.review, a.notes,
             u.id as user_id, u.email, u.first_name, u.last_name, u.phone
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.professional_id = ? AND a.scheduled_time <= NOW()
      ORDER BY a.scheduled_time DESC
      LIMIT 50
    `, [professionalId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const { patientId } = req.params;
    // Verify that this patient has at least one appointment with this professional (consent implied)
    const [check] = await pool.query(
      'SELECT id FROM appointments WHERE professional_id = ? AND user_id = ? LIMIT 1',
      [professionalId, patientId]
    );
    if (check.length === 0) {
      return res.status(403).json({ error: 'No consent to view this patient\'s history.' });
    }
    const [rows] = await pool.query(`
      SELECT a.id, a.scheduled_time, a.duration_minutes, a.status, a.meeting_type,
             a.rating, a.review, a.notes,
             u.id as user_id, u.email, u.first_name, u.last_name, u.phone
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.professional_id = ? AND a.user_id = ?
      ORDER BY a.scheduled_time DESC
    `, [professionalId, patientId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const { id } = req.params;
    const { status } = req.body;
    const validStatus = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ? AND professional_id = ?',
      [status, id, professionalId]
    );
    await logAuditAction(req.user.id, 'professional', req.user.email, `Updated appointment ${id} status to ${status}`, 'appointment', id, { status });
    res.json({ message: 'Appointment updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addNote = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const { id } = req.params;
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'Note is required' });
    await pool.query(
      'UPDATE appointments SET notes = CONCAT(notes, ?, ?) WHERE id = ? AND professional_id = ?',
      ['\n[Professional Note] ', note, id, professionalId]
    );
    await logAuditAction(req.user.id, 'professional', req.user.email, `Added note to appointment ${id}`, 'appointment', id);
    res.json({ message: 'Note added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};