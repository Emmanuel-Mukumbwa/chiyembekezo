const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');
const { checkAndAwardAchievements } = require('../services/achievementService');

// ---------- Breathing ----------
exports.getBreathingTypes = async (req, res) => {
  const types = [
    { id: 'box', name: 'Box Breathing', description: 'Inhale, hold, exhale, hold – equal times.' },
    { id: '478', name: '4-7-8 Breathing', description: 'Inhale 4s, hold 7s, exhale 8s.' },
    { id: 'deep', name: 'Deep Breathing', description: 'Slow, deep belly breaths.' },
    { id: 'calm', name: 'Calm Breathing', description: 'Gentle, soothing rhythm.' },
  ];
  res.json(types);
};

exports.completeBreathing = async (req, res) => {
  const userId = req.user.id;
  const { session_name, duration_seconds, mood_before, mood_after } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO wellness_sessions
       (user_id, session_type, session_name, duration_seconds, completed, mood_before, mood_after)
       VALUES (?, 'breathing', ?, ?, TRUE, ?, ?)`,
      [userId, session_name, duration_seconds, mood_before || null, mood_after || null]
    );
    // Audit log
    await logAuditAction(
      userId,
      'user',
      req.user.email,
      'Completed breathing session',
      'wellness',
      result.insertId,
      { session_name, duration_seconds }
    );

    // Check for achievements after completing wellness session
    await checkAndAwardAchievements(userId, 'wellness');

    res.json({ message: 'Breathing session saved.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------- Meditation ----------
exports.getMeditations = async (req, res) => {
  // Static list – can be extended from DB later
  const meditations = [
    { id: 1, title: 'Quick Calm', duration: 2, category: 'Quick' },
    { id: 2, title: 'Relax', duration: 5, category: 'Relax' },
    { id: 3, title: 'Sleep', duration: 10, category: 'Sleep' },
    { id: 4, title: 'Stress Relief', duration: 15, category: 'Stress Relief' },
    { id: 5, title: 'Anxiety Release', duration: 15, category: 'Anxiety' },
    { id: 6, title: 'Gratitude', duration: 10, category: 'Gratitude' },
  ];
  res.json(meditations);
};

exports.completeMeditation = async (req, res) => {
  const userId = req.user.id;
  const { session_name, duration_seconds, mood_before, mood_after } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO wellness_sessions
       (user_id, session_type, session_name, duration_seconds, completed, mood_before, mood_after)
       VALUES (?, 'meditation', ?, ?, TRUE, ?, ?)`,
      [userId, session_name, duration_seconds, mood_before || null, mood_after || null]
    );
    await logAuditAction(
      userId,
      'user',
      req.user.email,
      'Completed meditation session',
      'wellness',
      result.insertId,
      { session_name, duration_seconds }
    );

    // Check for achievements
    await checkAndAwardAchievements(userId, 'wellness');

    res.json({ message: 'Meditation session saved.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------- Grounding ----------
exports.getGroundingExercises = async (req, res) => {
  const exercises = [
    { id: '54321', name: '5-4-3-2-1', description: 'Engage all five senses.' },
    { id: 'pmr', name: 'Progressive Muscle Relaxation', description: 'Tense and relax each muscle group.' },
    { id: 'bodyscan', name: 'Body Scan', description: 'Bring awareness to each part of your body.' },
    { id: 'visualization', name: 'Positive Visualization', description: 'Imagine a peaceful place.' },
    { id: 'safeplace', name: 'Safe Place Exercise', description: 'Create a mental safe space.' },
  ];
  res.json(exercises);
};

exports.completeGrounding = async (req, res) => {
  const userId = req.user.id;
  const { session_name, duration_seconds, mood_before, mood_after } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO wellness_sessions
       (user_id, session_type, session_name, duration_seconds, completed, mood_before, mood_after)
       VALUES (?, 'grounding', ?, ?, TRUE, ?, ?)`,
      [userId, session_name, duration_seconds, mood_before || null, mood_after || null]
    );
    await logAuditAction(
      userId,
      'user',
      req.user.email,
      'Completed grounding exercise',
      'wellness',
      result.insertId,
      { session_name, duration_seconds }
    );

    // Check for achievements
    await checkAndAwardAchievements(userId, 'wellness');

    res.json({ message: 'Grounding session saved.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------- Relaxation Sounds ----------
exports.getSounds = async (req, res) => {
  const sounds = [
    { id: 'rain', name: 'Rain', icon: '🌧' },
    { id: 'forest', name: 'Forest', icon: '🌲' },
    { id: 'ocean', name: 'Ocean', icon: '🌊' },
    { id: 'fireplace', name: 'Fireplace', icon: '🔥' },
    { id: 'night', name: 'Night', icon: '🌙' },
    { id: 'birds', name: 'Birds', icon: '🐦' },
    { id: 'piano', name: 'Piano', icon: '🎹' },
    { id: 'whitenoise', name: 'White Noise', icon: '🤍' },
  ];
  res.json(sounds);
};

// ---------- Timers ----------
exports.getTimers = async (req, res) => {
  const timers = [
    { id: 'pomodoro', name: 'Pomodoro', default: 25, break: 5 },
    { id: 'study', name: 'Study', default: 60 },
    { id: 'focus', name: 'Focus', default: 30 },
    { id: 'meditation-timer', name: 'Meditation', default: 10 },
    { id: 'sleep-timer', name: 'Sleep', default: 30 },
  ];
  res.json(timers);
};

// ---------- Daily Wellness ----------
exports.getDailyWellness = async (req, res) => {
  // For now, return a static checklist.
  // In production, you could store user preferences per day in a separate table.
  const checklist = [
    { id: 'water', label: 'Drink Water', checked: false },
    { id: 'medicine', label: 'Take Medicine', checked: false },
    { id: 'journal', label: 'Journal', checked: false },
    { id: 'exercise', label: 'Exercise', checked: false },
    { id: 'pray', label: 'Pray', checked: false },
    { id: 'meditation', label: 'Meditation', checked: false },
    { id: 'walk', label: 'Walk', checked: false },
  ];
  res.json(checklist);
};

exports.updateDailyWellness = async (req, res) => {
  // For MVP, just log it.
  const userId = req.user.id;
  const { checklist } = req.body;
  await logAuditAction(
    userId,
    'user',
    req.user.email,
    'Updated daily wellness checklist',
    'wellness',
    null,
    { checklist }
  );
  res.json({ message: 'Daily wellness updated.' });
};

// ---------- Dashboard Recommendations ----------
exports.getRecommendations = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get today's mood and recent stress levels from mood_entries
    const [todayMood] = await pool.query(
      `SELECT mood_score, stress_level, sleep_hours
       FROM mood_entries
       WHERE user_id = ?
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [userId]
    );
    const mood = todayMood[0] || {};
    const stress = mood.stress_level || 3;
    const moodScore = mood.mood_score || 3;

    // Rule-based recommendations
    let recommendations = [];

    if (stress >= 4) {
      recommendations.push({ type: 'breathing', name: 'Box Breathing', link: '/wellness/breathing' });
      recommendations.push({ type: 'grounding', name: '5-4-3-2-1 Grounding', link: '/wellness/grounding' });
    }
    if (moodScore <= 2) {
      recommendations.push({ type: 'meditation', name: 'Gratitude Meditation', link: '/wellness/meditation' });
      recommendations.push({ type: 'journal', name: 'Write a Journal Entry', link: '/journal' });
    }
    if (mood.sleep_hours && mood.sleep_hours < 6) {
      recommendations.push({ type: 'sound', name: 'Sleep Sounds (Rain)', link: '/wellness/sounds' });
      recommendations.push({ type: 'timer', name: 'Sleep Timer (30 min)', link: '/wellness/timers' });
    }
    if (recommendations.length === 0) {
      recommendations.push({ type: 'breathing', name: 'Calm Breathing', link: '/wellness/breathing' });
      recommendations.push({ type: 'sounds', name: 'Relaxation Sounds', link: '/wellness/sounds' });
    }

    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};