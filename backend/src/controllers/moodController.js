const pool = require('../config/db');
const { checkAndAwardAchievements } = require('../services/achievementService');

// Map mood string to score
const moodMap = { happy: 5, okay: 4, neutral: 3, sad: 2, overwhelmed: 1 };

// @desc    Save or update today's mood entry
// @route   POST /api/mood
exports.saveMood = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { mood, energy, stress, sleep, exercise, water, note } = req.body;

    // Validate mood
    const moodScore = moodMap[mood];
    if (!moodScore) {
      return res.status(400).json({ error: 'Invalid mood value' });
    }

    // Build query with optional fields
    const query = `
      INSERT INTO mood_entries (
        user_id, mood_score, energy_level, stress_level,
        sleep_hours, exercise_minutes, water_intake, notes, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      ON DUPLICATE KEY UPDATE
        mood_score = VALUES(mood_score),
        energy_level = VALUES(energy_level),
        stress_level = VALUES(stress_level),
        sleep_hours = VALUES(sleep_hours),
        exercise_minutes = VALUES(exercise_minutes),
        water_intake = VALUES(water_intake),
        notes = VALUES(notes)
    `;
    await pool.query(query, [
      userId,
      moodScore,
      energy || null,
      stress || null,
      sleep || null,
      exercise || null,
      water || null,
      note || null
    ]);

    // Fetch the updated entry to return
    const [rows] = await pool.query(
      `SELECT * FROM mood_entries WHERE user_id = ? AND recorded_at = CURDATE()`,
      [userId]
    );
    const entry = rows[0] || {};

    // Check for achievements after saving mood
    await checkAndAwardAchievements(userId, 'mood_checkin');

    res.status(201).json({
      message: 'Mood saved successfully',
      entry: {
        mood: Object.keys(moodMap).find(key => moodMap[key] === entry.mood_score),
        mood_score: entry.mood_score,
        energy: entry.energy_level,
        stress: entry.stress_level,
        sleep: entry.sleep_hours,
        exercise: entry.exercise_minutes,
        water: entry.water_intake,
        notes: entry.notes,
        recorded_at: entry.recorded_at,
        created_at: entry.created_at,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get today's mood entry
// @route   GET /api/mood/today
exports.getTodayMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM mood_entries WHERE user_id = ? AND recorded_at = CURDATE()`,
      [userId]
    );
    if (rows.length === 0) {
      return res.json({ entry: null });
    }
    const entry = rows[0];
    const moodMapReverse = { 5: 'happy', 4: 'okay', 3: 'neutral', 2: 'sad', 1: 'overwhelmed' };
    res.json({
      entry: {
        mood: moodMapReverse[entry.mood_score],
        mood_score: entry.mood_score,
        energy: entry.energy_level,
        stress: entry.stress_level,
        sleep: entry.sleep_hours,
        exercise: entry.exercise_minutes,
        water: entry.water_intake,
        notes: entry.notes,
        recorded_at: entry.recorded_at,
        created_at: entry.created_at,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get mood history (last 30 entries)
// @route   GET /api/mood/history
exports.getMoodHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM mood_entries
       WHERE user_id = ?
       ORDER BY recorded_at DESC
       LIMIT 30`,
      [userId]
    );
    const moodMapReverse = { 5: 'happy', 4: 'okay', 3: 'neutral', 2: 'sad', 1: 'overwhelmed' };
    const history = rows.map(entry => ({
      mood: moodMapReverse[entry.mood_score],
      mood_score: entry.mood_score,
      energy: entry.energy_level,
      stress: entry.stress_level,
      sleep: entry.sleep_hours,
      exercise: entry.exercise_minutes,
      water: entry.water_intake,
      notes: entry.notes,
      recorded_at: entry.recorded_at,
    }));
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};