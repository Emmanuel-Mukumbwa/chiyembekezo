const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// Get availability for a specific professional (public)
exports.getAvailability = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const [rows] = await pool.query(`
      SELECT id, day_of_week, start_time, end_time, is_recurring, specific_date
      FROM professional_availability
      WHERE professional_id = ?
      ORDER BY FIELD(day_of_week, 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'), start_time
    `, [professionalId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get availability for the authenticated professional (using req.user.id)
exports.getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get professional record
    const [pro] = await pool.query('SELECT id FROM professionals WHERE user_id = ?', [userId]);
    if (pro.length === 0) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }
    const professionalId = pro[0].id;
    const [rows] = await pool.query(`
      SELECT id, day_of_week, start_time, end_time, is_recurring, specific_date
      FROM professional_availability
      WHERE professional_id = ?
      ORDER BY FIELD(day_of_week, 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'), start_time
    `, [professionalId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set availability (upsert) for authenticated professional
exports.setAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const [pro] = await pool.query('SELECT id FROM professionals WHERE user_id = ?', [userId]);
    if (pro.length === 0) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }
    const professionalId = pro[0].id;

    const { slots } = req.body;
    await pool.query('DELETE FROM professional_availability WHERE professional_id = ?', [professionalId]);

    if (slots && slots.length > 0) {
      for (const slot of slots) {
        const { day_of_week, start_time, end_time, is_recurring = true, specific_date = null } = slot;
        await pool.query(`
          INSERT INTO professional_availability
          (professional_id, day_of_week, start_time, end_time, is_recurring, specific_date)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [professionalId, day_of_week, start_time, end_time, is_recurring, specific_date]);
      }
    }

    await logAuditAction(
      userId,
      'professional',
      req.user.email,
      'Updated availability',
      'availability',
      null,
      { slots_count: slots.length }
    );

    res.json({ message: 'Availability updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a specific slot
exports.deleteAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const [pro] = await pool.query('SELECT id FROM professionals WHERE user_id = ?', [userId]);
    if (pro.length === 0) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }
    const professionalId = pro[0].id;
    const { id } = req.params;
    await pool.query('DELETE FROM professional_availability WHERE id = ? AND professional_id = ?', [id, professionalId]);
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available time slots for a given date range (for booking)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Date required' });

    const targetDate = new Date(date);
    const dayOfWeek = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][targetDate.getDay()];

    const [slots] = await pool.query(`
      SELECT start_time, end_time
      FROM professional_availability
      WHERE professional_id = ?
        AND ( (is_recurring = 1 AND day_of_week = ?)
              OR (is_recurring = 0 AND specific_date = ?) )
    `, [professionalId, dayOfWeek, date]);

    const [bookings] = await pool.query(`
      SELECT scheduled_time, duration_minutes
      FROM appointments
      WHERE professional_id = ? AND DATE(scheduled_time) = ?
        AND status IN ('pending','confirmed')
    `, [professionalId, date]);

    const availableSlots = [];
    for (const slot of slots) {
      let start = new Date(`${date}T${slot.start_time}`);
      const end = new Date(`${date}T${slot.end_time}`);
      while (start < end) {
        const isBooked = bookings.some(b => {
          const bookedStart = new Date(b.scheduled_time);
          const bookedEnd = new Date(bookedStart.getTime() + b.duration_minutes * 60000);
          return (start >= bookedStart && start < bookedEnd);
        });
        if (!isBooked) {
          availableSlots.push(start.toTimeString().slice(0,5));
        }
        start = new Date(start.getTime() + 30 * 60000);
      }
    }
    res.json(availableSlots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};