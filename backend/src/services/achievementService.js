const pool = require('../config/db');

// Check and award achievements for a user
const checkAndAwardAchievements = async (userId, actionType, actionData = {}) => {
  try {
    // Fetch all achievements not yet earned
    const [achievements] = await pool.query(`
      SELECT a.* FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      WHERE ua.id IS NULL
    `, [userId]);

    if (achievements.length === 0) return;

    // For each achievement, check criteria
    for (const achievement of achievements) {
      const criteria = JSON.parse(achievement.criteria);
      const { action, count, days } = criteria;

      let earned = false;

      switch (action) {
        case 'mood_checkin': {
          const [rows] = await pool.query('SELECT COUNT(*) as total FROM mood_entries WHERE user_id = ?', [userId]);
          earned = rows[0].total >= count;
          break;
        }
        case 'journal': {
          const [rows] = await pool.query('SELECT COUNT(*) as total FROM journal_entries WHERE user_id = ?', [userId]);
          earned = rows[0].total >= count;
          break;
        }
        case 'streak': {
          // Compute current streak from mood_entries
          const streak = await getMoodStreak(userId);
          earned = streak >= days;
          break;
        }
        case 'wellness': {
          const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM wellness_sessions WHERE user_id = ? AND completed = TRUE',
            [userId]
          );
          earned = rows[0].total >= count;
          break;
        }
        case 'quiz_pass': {
          const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM quiz_attempts WHERE user_id = ? AND passed = TRUE',
            [userId]
          );
          earned = rows[0].total >= count;
          break;
        }
        case 'course_start': {
          const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM course_progress WHERE user_id = ? AND progress_percent > 0',
            [userId]
          );
          earned = rows[0].total >= count;
          break;
        }
        case 'course_complete': {
          const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM course_progress WHERE user_id = ? AND completed = TRUE',
            [userId]
          );
          earned = rows[0].total >= count;
          break;
        }
        case 'goal': {
          const [rows] = await pool.query('SELECT COUNT(*) as total FROM goals WHERE user_id = ?', [userId]);
          earned = rows[0].total >= count;
          break;
        }
        case 'goal_complete': {
          const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM goals WHERE user_id = ? AND status = "completed"',
            [userId]
          );
          earned = rows[0].total >= count;
          break;
        }
        default:
          // If action type matches a specific action from actionData (e.g., from a triggered event)
          if (action === 'mood_checkin' && actionData.moodCheckinCount) {
            earned = actionData.moodCheckinCount >= count;
          } else if (action === 'journal' && actionData.journalCount) {
            earned = actionData.journalCount >= count;
          }
          // else skip
      }

      if (earned) {
        // Award achievement
        await pool.query(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievement.id]
        );
        // Log audit (optional)
        console.log(`🏆 Achievement earned: ${achievement.name} for user ${userId}`);
      }
    }
  } catch (err) {
    console.error('❌ Error checking achievements:', err);
  }
};

// Helper: Get current mood streak
const getMoodStreak = async (userId) => {
  const [rows] = await pool.query(
    `SELECT recorded_at FROM mood_entries
     WHERE user_id = ?
     ORDER BY recorded_at DESC`,
    [userId]
  );
  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const entryDate = new Date(rows[i].recorded_at);
    entryDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

module.exports = { checkAndAwardAchievements };