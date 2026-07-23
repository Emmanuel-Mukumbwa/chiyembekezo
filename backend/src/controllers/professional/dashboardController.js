const pool = require('../../config/db');

// @desc    Get professional dashboard data
// @route   GET /api/professional/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get professional record
    const [proRows] = await pool.query(
      'SELECT id, is_verified, specialization, district, clinic_name FROM professionals WHERE user_id = ?',
      [userId]
    );
    if (proRows.length === 0) {
      return res.status(404).json({ error: 'Professional profile not found.' });
    }
    const professional = proRows[0];

    // 2. Appointments stats
    const [apptStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM appointments
       WHERE professional_id = ?`,
      [professional.id]
    );
    const appointmentStats = apptStats[0] || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

    // 3. Recent appointments (last 5)
    const [recentAppointments] = await pool.query(
      `SELECT a.id, a.scheduled_time, a.status, a.meeting_type,
              u.first_name, u.last_name, u.email
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       WHERE a.professional_id = ?
       ORDER BY a.scheduled_time DESC
       LIMIT 5`,
      [professional.id]
    );

    // 4. Total patients (unique users with completed appointments)
    const [patientCount] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as total
       FROM appointments
       WHERE professional_id = ? AND status = 'completed'`,
      [professional.id]
    );

    // 5. Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const [todayAppointments] = await pool.query(
      `SELECT COUNT(*) as count
       FROM appointments
       WHERE professional_id = ? AND DATE(scheduled_time) = ? AND status IN ('pending', 'confirmed')`,
      [professional.id, today]
    );

    res.json({
      professional: {
        id: professional.id,
        isVerified: professional.is_verified === 1,
        specialization: professional.specialization,
        district: professional.district,
        clinic: professional.clinic_name,
      },
      appointmentStats,
      recentAppointments,
      totalPatients: patientCount[0]?.total || 0,
      todayAppointments: todayAppointments[0]?.count || 0,
    });
  } catch (err) {
    console.error('❌ Professional dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};