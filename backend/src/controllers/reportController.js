const pool = require('../config/db');

// Get monthly report for a user
exports.getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    let { year, month } = req.query;
    const now = new Date();
    if (!year) year = now.getFullYear();
    if (!month) month = now.getMonth() + 1; // 1-12

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month

    // 1. Mood stats
    const [moodStats] = await pool.query(
      `SELECT AVG(mood_score) as avg_mood,
              COUNT(*) as mood_count,
              SUM(CASE WHEN mood_score >= 4 THEN 1 ELSE 0 END) as happy_days,
              SUM(CASE WHEN mood_score <= 2 THEN 1 ELSE 0 END) as low_days
       FROM mood_entries
       WHERE user_id = ? AND recorded_at BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );

    // Mood distribution
    const [moodDistribution] = await pool.query(
      `SELECT mood_score, COUNT(*) as count
       FROM mood_entries
       WHERE user_id = ? AND recorded_at BETWEEN ? AND ?
       GROUP BY mood_score
       ORDER BY mood_score`,
      [userId, startDate, endDate]
    );

    // 2. Stress trend (weekly average)
    const [stressTrend] = await pool.query(
      `SELECT WEEK(recorded_at, 1) as week_number,
              AVG(stress_level) as avg_stress
       FROM mood_entries
       WHERE user_id = ? AND recorded_at BETWEEN ? AND ? AND stress_level IS NOT NULL
       GROUP BY WEEK(recorded_at, 1)
       ORDER BY week_number`,
      [userId, startDate, endDate]
    );

    // 3. Sleep average
    const [sleepStats] = await pool.query(
      `SELECT AVG(sleep_hours) as avg_sleep,
              COUNT(*) as sleep_count
       FROM mood_entries
       WHERE user_id = ? AND recorded_at BETWEEN ? AND ? AND sleep_hours IS NOT NULL`,
      [userId, startDate, endDate]
    );

    // 4. Journal entries count
    const [journalStats] = await pool.query(
      `SELECT COUNT(*) as journal_count
       FROM journal_entries
       WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );

    // 5. Habit completion rate
    const [habitStats] = await pool.query(
      `SELECT h.id, h.name,
              COUNT(DISTINCT l.logged_date) as logged_days,
              DATEDIFF(?, ?) + 1 as total_days
       FROM user_habits h
       LEFT JOIN habit_logs l ON h.id = l.habit_id AND l.logged_date BETWEEN ? AND ?
       WHERE h.user_id = ?
       GROUP BY h.id
       HAVING total_days > 0`,
      [endDate, startDate, startDate, endDate, userId]
    );
    const habitCompletion = habitStats.map(h => ({
      ...h,
      completion_rate: Math.round((h.logged_days / h.total_days) * 100),
    }));

    // 6. Assessments taken this month
    const [assessmentStats] = await pool.query(
      `SELECT at.name as assessment_type,
              ar.severity_level,
              ar.score,
              ar.taken_at
       FROM assessment_results ar
       JOIN assessment_types at ON ar.assessment_type_id = at.id
       WHERE ar.user_id = ? AND DATE(ar.taken_at) BETWEEN ? AND ?
       ORDER BY ar.taken_at DESC`,
      [userId, startDate, endDate]
    );

    // 7. Wellness sessions count
    const [wellnessStats] = await pool.query(
      `SELECT session_type, COUNT(*) as count,
              SUM(duration_seconds) as total_seconds
       FROM wellness_sessions
       WHERE user_id = ? AND completed = TRUE
         AND DATE(created_at) BETWEEN ? AND ?
       GROUP BY session_type`,
      [userId, startDate, endDate]
    );

    // 8. Generate recommendations based on data
    const recommendations = [];
    if (moodStats[0] && moodStats[0].avg_mood < 3) {
      recommendations.push({ type: 'mood', message: 'Your average mood is low. Consider daily journaling or a gratitude practice.' });
    }
    if (moodStats[0] && moodStats[0].low_days > 5) {
      recommendations.push({ type: 'mood', message: 'You had several low days. Try the 5-4-3-2-1 grounding exercise.' });
    }
    if (sleepStats[0] && sleepStats[0].avg_sleep < 6) {
      recommendations.push({ type: 'sleep', message: 'Your average sleep is below 6 hours. Try the sleep meditation or a consistent bedtime routine.' });
    }
    if (habitCompletion.some(h => h.completion_rate < 50)) {
      recommendations.push({ type: 'habits', message: 'Some habits have low completion rates. Try setting a daily reminder.' });
    }
    if (journalStats[0] && journalStats[0].journal_count < 3) {
      recommendations.push({ type: 'journal', message: 'You wrote fewer than 3 journal entries this month. Try a daily 5-minute journal.' });
    }
    if (wellnessStats.length === 0) {
      recommendations.push({ type: 'wellness', message: 'You haven\'t done any wellness sessions this month. Try a 2-minute breathing exercise.' });
    }

    // 9. Month summary
    const totalDays = new Date(year, month, 0).getDate();
    const trackedDays = moodStats[0] ? moodStats[0].mood_count : 0;
    const monthSummary = {
      totalDays,
      trackedDays,
      completionRate: Math.round((trackedDays / totalDays) * 100),
    };

    res.json({
      month: `${year}-${String(month).padStart(2, '0')}`,
      startDate,
      endDate,
      mood: moodStats[0] || { avg_mood: 0, mood_count: 0, happy_days: 0, low_days: 0 },
      moodDistribution,
      stressTrend,
      sleep: sleepStats[0] || { avg_sleep: 0, sleep_count: 0 },
      journal: journalStats[0] || { journal_count: 0 },
      habitCompletion,
      assessments: assessmentStats,
      wellness: wellnessStats,
      recommendations,
      summary: monthSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};