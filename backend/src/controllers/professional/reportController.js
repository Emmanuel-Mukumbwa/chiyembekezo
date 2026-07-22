const pool = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const [totalPatients] = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM appointments WHERE professional_id = ?',
      [professionalId]
    );
    const [totalAppointments] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE professional_id = ?',
      [professionalId]
    );
    const [avgRating] = await pool.query(
      'SELECT AVG(rating) as avg FROM appointments WHERE professional_id = ? AND rating IS NOT NULL',
      [professionalId]
    );
    const [upcoming] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE professional_id = ? AND scheduled_time > NOW() AND status IN ("pending", "confirmed")',
      [professionalId]
    );
    res.json({
      total_patients: totalPatients[0].count || 0,
      total_appointments: totalAppointments[0].count || 0,
      avg_rating: avgRating[0].avg ? parseFloat(avgRating[0].avg).toFixed(1) : null,
      upcoming: upcoming[0].count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};