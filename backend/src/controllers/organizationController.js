const pool = require('../config/db');

// Get current organization info
exports.getOrganizationInfo = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const [rows] = await pool.query(`
      SELECT id, name, type, contact_email, contact_phone, domain
      FROM organizations WHERE id = ?
    `, [orgId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get aggregated stats for the organization
exports.getStats = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { period = 'month' } = req.query; // month, quarter, year
    let dateCondition;
    switch (period) {
      case 'quarter': dateCondition = "DATE_SUB(NOW(), INTERVAL 3 MONTH)"; break;
      case 'year': dateCondition = "DATE_SUB(NOW(), INTERVAL 1 YEAR)"; break;
      default: dateCondition = "DATE_SUB(NOW(), INTERVAL 1 MONTH)"; break;
    }

    // Get all user IDs in this organization
    const [users] = await pool.query(
      'SELECT user_id FROM user_organizations WHERE organization_id = ?',
      [orgId]
    );
    const userIds = users.map(u => u.user_id);
    if (userIds.length === 0) {
      return res.json({
        total_members: 0,
        mood_avg: 0,
        stress_avg: 0,
        sleep_avg: 0,
        assessment_count: 0,
        journal_count: 0,
        wellness_sessions: 0,
        top_wellness_types: [],
        mood_distribution: [],
        resource_usage: 0,
        engagement_rate: 0,
      });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const params = [...userIds];

    // 1. Mood and stress averages
    const [moodResult] = await pool.query(`
      SELECT AVG(mood_score) as mood_avg, AVG(stress_level) as stress_avg, AVG(sleep_hours) as sleep_avg
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
    `, params);

    // 2. Assessment count
    const [assessmentResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM assessment_results ar
      JOIN assessment_types at ON ar.assessment_type_id = at.id
      WHERE ar.user_id IN (${placeholders}) AND ar.taken_at >= ${dateCondition}
    `, params);

    // 3. Journal count
    const [journalResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM journal_entries
      WHERE user_id IN (${placeholders}) AND created_at >= ${dateCondition}
    `, params);

    // 4. Wellness sessions
    const [wellnessResult] = await pool.query(`
      SELECT COUNT(*) as count, session_type
      FROM wellness_sessions
      WHERE user_id IN (${placeholders}) AND completed = TRUE AND created_at >= ${dateCondition}
      GROUP BY session_type
    `, params);

    // 5. Mood distribution
    const [moodDist] = await pool.query(`
      SELECT mood_score, COUNT(*) as count
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
      GROUP BY mood_score
    `, params);

    // 6. Resource usage (views of resources in articles and resources)
    const [resourceResult] = await pool.query(`
      SELECT COUNT(DISTINCT resource_id) as count
      FROM course_progress
      WHERE user_id IN (${placeholders}) AND last_accessed_at >= ${dateCondition}
    `, params);

    // 7. Engagement rate (members with at least one mood entry in period)
    const [engagementResult] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
    `, params);

    const totalMembers = userIds.length;
    const engagedMembers = engagementResult[0]?.count || 0;
    const engagementRate = totalMembers > 0 ? (engagedMembers / totalMembers) * 100 : 0;

    // Top wellness types
    const topWellness = wellnessResult.map(w => ({ type: w.session_type, count: w.count }));

    res.json({
      total_members: totalMembers,
      mood_avg: moodResult[0]?.mood_avg ? parseFloat(moodResult[0].mood_avg).toFixed(2) : 0,
      stress_avg: moodResult[0]?.stress_avg ? parseFloat(moodResult[0].stress_avg).toFixed(2) : 0,
      sleep_avg: moodResult[0]?.sleep_avg ? parseFloat(moodResult[0].sleep_avg).toFixed(2) : 0,
      assessment_count: assessmentResult[0]?.count || 0,
      journal_count: journalResult[0]?.count || 0,
      wellness_sessions: wellnessResult.reduce((sum, w) => sum + w.count, 0),
      top_wellness_types: topWellness,
      mood_distribution: moodDist.map(d => ({ mood_score: d.mood_score, count: d.count })),
      resource_usage: resourceResult[0]?.count || 0,
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};