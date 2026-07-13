const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// Book an appointment
exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { professionalId, scheduledTime, durationMinutes = 60, notes } = req.body;

    if (!professionalId || !scheduledTime) {
      return res.status(400).json({ error: 'Professional and scheduled time are required' });
    }

    // Check if professional exists and is verified
    const [pro] = await pool.query('SELECT id FROM professionals WHERE id = ? AND is_verified = 1', [professionalId]);
    if (pro.length === 0) {
      return res.status(404).json({ error: 'Professional not found or not verified' });
    }

    // Check for overlapping appointments (simple check)
    const [overlap] = await pool.query(`
      SELECT id FROM appointments
      WHERE professional_id = ? AND status IN ('pending', 'confirmed')
      AND scheduled_time BETWEEN DATE_SUB(?, INTERVAL ? MINUTE) AND DATE_ADD(?, INTERVAL ? MINUTE)
    `, [professionalId, scheduledTime, durationMinutes, scheduledTime, durationMinutes]);
    if (overlap.length > 0) {
      return res.status(409).json({ error: 'Time slot already taken. Please choose another time.' });
    }

    const query = `
      INSERT INTO appointments (user_id, professional_id, scheduled_time, duration_minutes, notes, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const [result] = await pool.query(query, [userId, professionalId, scheduledTime, durationMinutes, notes || null]);
    const appointmentId = result.insertId;

    await logAuditAction(
      userId,
      'user',
      req.user.email,
      `Booked appointment with professional ${professionalId}`,
      'appointment',
      appointmentId,
      { scheduledTime, durationMinutes }
    );

    res.status(201).json({ message: 'Appointment booked successfully', id: appointmentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT a.id, a.scheduled_time, a.duration_minutes, a.status, a.notes, a.rating,
             p.id as professional_id, u.first_name, u.last_name, u.phone,
             p.specialization, p.clinic_name, p.district
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.scheduled_time DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, status FROM appointments WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending appointments can be cancelled' });
    }
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);
    await logAuditAction(
      userId,
      'user',
      req.user.email,
      `Cancelled appointment ${id}`,
      'appointment',
      id
    );
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Rate appointment (after completion)
exports.rateAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const [rows] = await pool.query('SELECT id, status FROM appointments WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (rows[0].status !== 'completed') {
      return res.status(400).json({ error: 'Only completed appointments can be rated' });
    }
    await pool.query('UPDATE appointments SET rating = ?, review = ? WHERE id = ?', [rating, review || null, id]);
    res.json({ message: 'Rating submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};