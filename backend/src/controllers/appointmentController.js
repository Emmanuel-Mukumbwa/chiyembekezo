const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');
const { sendEmail, sendSMS, sendPush } = require('../services/notificationService');

// Book an appointment (with meeting type and notifications)
exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      professionalId,
      scheduledTime,
      durationMinutes = 60,
      notes,
      meetingType = 'video'
    } = req.body;

    if (!professionalId || !scheduledTime) {
      return res.status(400).json({ error: 'Professional and scheduled time are required' });
    }

    // Check if professional exists and is verified
    const [pro] = await pool.query(
      'SELECT id, user_id FROM professionals WHERE id = ? AND is_verified = 1',
      [professionalId]
    );
    if (pro.length === 0) {
      return res.status(404).json({ error: 'Professional not found or not verified' });
    }

    // Check for overlapping appointments
    const [overlap] = await pool.query(
      `SELECT id FROM appointments
       WHERE professional_id = ? AND status IN ('pending', 'confirmed')
       AND scheduled_time BETWEEN DATE_SUB(?, INTERVAL ? MINUTE)
       AND DATE_ADD(?, INTERVAL ? MINUTE)`,
      [professionalId, scheduledTime, durationMinutes, scheduledTime, durationMinutes]
    );
    if (overlap.length > 0) {
      return res.status(409).json({ error: 'Time slot already taken. Please choose another time.' });
    }

    // Generate meeting link for video
    let meetingLink = null;
    if (meetingType === 'video') {
      meetingLink = `https://meet.chiyembekezo.mw/${Math.random().toString(36).substring(2, 10)}`;
    }

    const query = `
      INSERT INTO appointments
      (user_id, professional_id, scheduled_time, duration_minutes, notes, status, meeting_type, meeting_link)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
    `;
    const [result] = await pool.query(query, [
      userId,
      professionalId,
      scheduledTime,
      durationMinutes,
      notes || null,
      meetingType,
      meetingLink
    ]);
    const appointmentId = result.insertId;

    // Send notifications
    const userEmail = req.user.email;
    await sendEmail(
      userId,
      'Appointment Confirmed',
      `Your appointment with professional ID ${professionalId} is confirmed for ${new Date(scheduledTime).toLocaleString()}`
    );
    await sendSMS(
      userId,
      `Appointment confirmed at ${new Date(scheduledTime).toLocaleString()}`
    );
    await sendEmail(
      pro[0].user_id,
      'New Appointment Request',
      `New booking from ${userEmail} at ${new Date(scheduledTime).toLocaleString()}`
    );

    await logAuditAction(
      userId,
      'user',
      userEmail,
      `Booked appointment with professional ${professionalId}`,
      'appointment',
      appointmentId,
      { scheduledTime, durationMinutes, meetingType }
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      id: appointmentId,
      meetingLink
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { newScheduledTime, durationMinutes = 60 } = req.body;

    if (!newScheduledTime) {
      return res.status(400).json({ error: 'New scheduled time is required' });
    }

    // Get appointment details
    const [rows] = await pool.query(
      'SELECT id, professional_id, status FROM appointments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (rows[0].status !== 'pending' && rows[0].status !== 'confirmed') {
      return res.status(400).json({ error: 'Only pending or confirmed appointments can be rescheduled' });
    }

    // Check for overlap
    const [overlap] = await pool.query(
      `SELECT id FROM appointments
       WHERE professional_id = ? AND id != ? AND status IN ('pending', 'confirmed')
       AND scheduled_time BETWEEN DATE_SUB(?, INTERVAL ? MINUTE)
       AND DATE_ADD(?, INTERVAL ? MINUTE)`,
      [rows[0].professional_id, id, newScheduledTime, durationMinutes, newScheduledTime, durationMinutes]
    );
    if (overlap.length > 0) {
      return res.status(409).json({ error: 'Time slot already taken' });
    }

    await pool.query(
      `UPDATE appointments
       SET scheduled_time = ?, duration_minutes = ?
       WHERE id = ? AND user_id = ?`,
      [newScheduledTime, durationMinutes, id, userId]
    );

    await logAuditAction(
      userId,
      'user',
      req.user.email,
      `Rescheduled appointment ${id}`,
      'appointment',
      id,
      { newScheduledTime, durationMinutes }
    );

    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT a.id, a.scheduled_time, a.duration_minutes, a.status, a.notes,
              a.rating, a.meeting_type, a.meeting_link,
              p.id as professional_id, u.first_name, u.last_name, u.phone,
              p.specialization, p.clinic_name, p.district
       FROM appointments a
       JOIN professionals p ON a.professional_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE a.user_id = ?
       ORDER BY a.scheduled_time DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, status FROM appointments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (rows[0].status !== 'pending' && rows[0].status !== 'confirmed') {
      return res.status(400).json({ error: 'Only pending or confirmed appointments can be cancelled' });
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
    console.error('Error cancelling appointment:', err);
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
    const [rows] = await pool.query(
      'SELECT id, status FROM appointments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (rows[0].status !== 'completed') {
      return res.status(400).json({ error: 'Only completed appointments can be rated' });
    }
    await pool.query('UPDATE appointments SET rating = ?, review = ? WHERE id = ?', [rating, review || null, id]);
    res.json({ message: 'Rating submitted' });
  } catch (err) {
    console.error('Error rating appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};