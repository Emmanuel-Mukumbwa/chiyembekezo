const pool = require('../config/db');

// Get all achievements for the current user (earned + unearned)
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all achievements and mark which ones user has earned
    const [rows] = await pool.query(`
      SELECT a.id, a.name, a.description, a.icon, a.category, a.points,
             CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as earned,
             ua.earned_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY a.category, a.name
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get only earned achievements (for dashboard widget)
exports.getEarnedAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT a.id, a.name, a.description, a.icon, a.category, a.points, ua.earned_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.earned_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get total points earned by user
exports.getUserPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT SUM(a.points) as total_points
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `, [userId]);
    res.json({ total_points: rows[0].total_points || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};