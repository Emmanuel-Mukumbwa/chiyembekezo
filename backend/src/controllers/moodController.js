const pool = require('../config/db');

exports.saveMood = async (req, res) => {
  try {
    const { userId, mood, note } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const moodMap = { happy: 5, okay: 4, neutral: 3, sad: 2, overwhelmed: 1 };
    const moodScore = moodMap[mood];
    if (!moodScore) {
      return res.status(400).json({ error: 'Invalid mood value' });
    }

    // MySQL ON DUPLICATE KEY UPDATE
    const query = `
      INSERT INTO mood_entries (user_id, mood_score, notes, recorded_at)
      VALUES (?, ?, ?, CURDATE())
      ON DUPLICATE KEY UPDATE
        mood_score = VALUES(mood_score),
        notes = VALUES(notes)
    `;
    await pool.query(query, [userId, moodScore, note || null]);
    // To get the inserted/updated row, we could query it back, but not necessary.
    res.status(201).json({ message: 'Mood saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMoodHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT mood_score, notes, recorded_at
      FROM mood_entries
      WHERE user_id = ?
      ORDER BY recorded_at DESC
      LIMIT 30
    `;
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};