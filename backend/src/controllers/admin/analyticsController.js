const pool = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [activeUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const [totalPosts] = await pool.query('SELECT COUNT(*) as count FROM forum_posts');
    const [totalAppointments] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const [totalAssessments] = await pool.query('SELECT COUNT(*) as count FROM assessment_results');
    const [totalMoodEntries] = await pool.query('SELECT COUNT(*) as count FROM mood_entries');
    const [totalJournalEntries] = await pool.query('SELECT COUNT(*) as count FROM journal_entries');
    // Weekly new users (last 7 days)
    const [weeklyUsers] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
    `);
    // Monthly mood trend (last 6 months)
    const [moodTrend] = await pool.query(`
      SELECT DATE_FORMAT(recorded_at, '%Y-%m') as month, AVG(mood_score) as avg_mood
      FROM mood_entries
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    res.json({
      users: { total: totalUsers[0].count, active: activeUsers[0].count },
      posts: totalPosts[0].count,
      appointments: totalAppointments[0].count,
      assessments: totalAssessments[0].count,
      mood_entries: totalMoodEntries[0].count,
      journal_entries: totalJournalEntries[0].count,
      weekly_users: weeklyUsers,
      mood_trend: moodTrend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};