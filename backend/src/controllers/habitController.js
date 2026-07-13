const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// ===== Habit CRUD =====
exports.getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT h.*, g.title as goal_title
      FROM user_habits h
      LEFT JOIN goals g ON h.goal_id = g.id
      WHERE h.user_id = ?
      ORDER BY h.created_at ASC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, target_value, unit, frequency, goal_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Habit name is required' });

    const [result] = await pool.query(`
      INSERT INTO user_habits (user_id, name, category, target_value, unit, frequency, goal_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, category || 'general', target_value || 1, unit || 'times', frequency || 'daily', goal_id || null]);
    res.status(201).json({ id: result.insertId, message: 'Habit created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, category, target_value, unit, frequency, goal_id } = req.body;
    await pool.query(`
      UPDATE user_habits
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          target_value = COALESCE(?, target_value),
          unit = COALESCE(?, unit),
          frequency = COALESCE(?, frequency),
          goal_id = COALESCE(?, goal_id)
      WHERE id = ? AND user_id = ?
    `, [name, category, target_value, unit, frequency, goal_id, id, userId]);
    res.json({ message: 'Habit updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM user_habits WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ===== Habit Logging =====
exports.logHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { habitId, value, loggedDate } = req.body;
    if (!habitId) return res.status(400).json({ error: 'Habit ID required' });

    const date = loggedDate || new Date().toISOString().split('T')[0];
    await pool.query(`
      INSERT INTO habit_logs (habit_id, user_id, value, logged_date)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE value = VALUES(value)
    `, [habitId, userId, value || 1, date]);

    // Check for achievements (streaks)
    await checkAchievements(userId);

    res.json({ message: 'Habit logged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get logs for a habit (last 30 days)
exports.getHabitLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { habitId } = req.params;
    const [rows] = await pool.query(`
      SELECT logged_date, value
      FROM habit_logs
      WHERE habit_id = ? AND user_id = ?
      ORDER BY logged_date DESC
      LIMIT 30
    `, [habitId, userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get today's log for all habits (for daily checklist)
exports.getTodayLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const [habits] = await pool.query('SELECT id, name FROM user_habits WHERE user_id = ?', [userId]);
    const [logs] = await pool.query(`
      SELECT habit_id, value, logged_date
      FROM habit_logs
      WHERE user_id = ? AND logged_date = ?
    `, [userId, today]);
    const map = {};
    logs.forEach(l => map[l.habit_id] = l);
    const result = habits.map(h => ({
      ...h,
      logged: !!map[h.id],
      value: map[h.id] ? map[h.id].value : 0,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ===== Streak & Achievements =====
async function checkAchievements(userId) {
  try {
    // Get all habits
    const [habits] = await pool.query('SELECT id FROM user_habits WHERE user_id = ?', [userId]);
    for (const habit of habits) {
      const [rows] = await pool.query(`
        SELECT logged_date
        FROM habit_logs
        WHERE habit_id = ? AND user_id = ? AND value > 0
        ORDER BY logged_date DESC
      `, [habit.id, userId]);
      // Compute streak
      let streak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      for (let i = 0; i < rows.length; i++) {
        const d = new Date(rows[i].logged_date);
        d.setHours(0,0,0,0);
        const expected = new Date(today);
        expected.setDate(today.getDate() - i);
        expected.setHours(0,0,0,0);
        if (d.getTime() === expected.getTime()) {
          streak++;
        } else break;
      }
      // Save achievement if streak milestone reached
      const milestones = [7, 14, 30, 60, 100];
      if (milestones.includes(streak)) {
        const [exists] = await pool.query(`
          SELECT id FROM goal_achievements
          WHERE user_id = ? AND achievement_type = ? AND details->>'$.habitId' = ?
        `, [userId, `streak_${streak}d`, habit.id]);
        if (exists.length === 0) {
          await pool.query(`
            INSERT INTO goal_achievements (user_id, achievement_type, details)
            VALUES (?, ?, ?)
          `, [userId, `streak_${streak}d`, JSON.stringify({ habitId: habit.id, streak })]);
        }
      }
    }
  } catch (err) {
    console.error('Error checking achievements:', err);
  }
}

// Get achievements for a user
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT * FROM goal_achievements
      WHERE user_id = ?
      ORDER BY achieved_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get goal templates
exports.getGoalTemplates = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM goal_templates');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};