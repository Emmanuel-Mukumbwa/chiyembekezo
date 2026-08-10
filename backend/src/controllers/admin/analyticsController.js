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
      ORDER BY date ASC
    `);

    // Monthly mood trend (last 6 months)
    const [moodTrend] = await pool.query(`
      SELECT DATE_FORMAT(recorded_at, '%Y-%m') as month, AVG(mood_score) as avg_mood
      FROM mood_entries
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    // Latest 5 users (for recent activity)
    const [latestUsers] = await pool.query(`
      SELECT id, email, first_name, last_name, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Professional verification stats
    const [totalProfessionals] = await pool.query('SELECT COUNT(*) as count FROM professionals');
    const [verifiedProfessionals] = await pool.query('SELECT COUNT(*) as count FROM professionals WHERE is_verified = 1');

    // Resource stats
    const [totalResources] = await pool.query('SELECT COUNT(*) as count FROM resources');
    const [publishedResources] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE is_published = 1');

    // Recent admin logs (last 10)
    const [recentLogs] = await pool.query(`
      SELECT id, admin_user_id, actor_type, actor_email, action, target_type, target_id, created_at
      FROM admin_logs
      ORDER BY created_at DESC
      LIMIT 10
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
      latest_users: latestUsers,
      professionals: {
        total: totalProfessionals[0].count || 0,
        verified: verifiedProfessionals[0].count || 0,
      },
      resources: {
        total: totalResources[0].count || 0,
        published: publishedResources[0].count || 0,
      },
      recent_logs: recentLogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
