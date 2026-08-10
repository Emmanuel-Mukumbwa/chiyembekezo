const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// Breathing techniques (static)
const breathingTechniques = [
  { id: 'box', name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, hold2: 4 },
  { id: '478', name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8, hold2: 0 },
  { id: 'deep', name: 'Deep Breathing', inhale: 5, hold: 0, exhale: 5, hold2: 0 },
  { id: 'calm', name: 'Calm Breathing', inhale: 6, hold: 0, exhale: 6, hold2: 0 },
];

exports.getBreathingTechniques = (req, res) => {
  res.json(breathingTechniques);
};

// Meditations – from database
exports.getMeditations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, category, duration, description, narrator, background_sound, audio_url, image_url FROM meditations WHERE is_active = 1 ORDER BY sort_order, title'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Sounds – from database
exports.getSounds = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, icon, color, audio_url, image_url FROM relaxation_sounds WHERE is_active = 1 ORDER BY sort_order, name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Grounding exercises (static)
const groundingExercises = [
  {
    id: '54321',
    name: '5-4-3-2-1',
    description: 'Engage all five senses to ground yourself.',
    steps: [
      { label: '5 things you can see', input: true },
      { label: '4 things you can touch', input: true },
      { label: '3 things you can hear', input: true },
      { label: '2 things you can smell', input: true },
      { label: '1 thing you can taste', input: true },
    ]
  },
  {
    id: 'pmr',
    name: 'Progressive Muscle Relaxation',
    description: 'Tense and relax each muscle group.',
    steps: [
      { label: 'Feet – tense for 5 seconds, then relax' },
      { label: 'Legs – tense for 5 seconds, then relax' },
      { label: 'Stomach – tense for 5 seconds, then relax' },
      { label: 'Chest – tense for 5 seconds, then relax' },
      { label: 'Hands & arms – tense for 5 seconds, then relax' },
      { label: 'Shoulders – tense for 5 seconds, then relax' },
      { label: 'Face & jaw – tense for 5 seconds, then relax' },
    ]
  },
  {
    id: 'bodyscan',
    name: 'Body Scan',
    description: 'Bring awareness to each part of your body.',
    steps: [
      { label: 'Focus on your breath for 3 breaths' },
      { label: 'Notice your feet – any sensations?', input: true },
      { label: 'Notice your legs and hips', input: true },
      { label: 'Notice your stomach and chest', input: true },
      { label: 'Notice your hands and arms', input: true },
      { label: 'Notice your shoulders and neck', input: true },
      { label: 'Notice your face and head', input: true },
    ]
  },
  {
    id: 'visualization',
    name: 'Positive Visualization',
    description: 'Imagine a peaceful place.',
    steps: [
      { label: 'Take 5 deep breaths with your eyes closed' },
      { label: 'Imagine a safe, calm place', input: true },
      { label: 'What do you see?', input: true },
      { label: 'What sounds do you hear?', input: true },
      { label: 'What does it feel like?', input: true },
    ]
  },
  {
    id: 'safeplace',
    name: 'Safe Place Exercise',
    description: 'Create a mental safe space.',
    steps: [
      { label: 'Sit comfortably, take 3 slow breaths' },
      { label: 'Imagine a place where you feel completely safe', input: true },
      { label: 'Who is there with you?', input: true },
      { label: 'What makes it safe?', input: true },
      { label: 'What is the atmosphere like?', input: true },
    ]
  }
];

exports.getGroundingExercises = (req, res) => {
  res.json(groundingExercises);
};

// Session recording for any wellness activity
exports.saveSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_type, session_name, duration_seconds, mood_before, mood_after, details } = req.body;
    if (!session_type || !session_name) {
      return res.status(400).json({ error: 'session_type and session_name are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO wellness_sessions (user_id, session_type, session_name, duration_seconds, mood_before, mood_after, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, session_type, session_name, duration_seconds || 0, mood_before || null, mood_after || null, details ? JSON.stringify(details) : null]
    );
    await logAuditAction(userId, 'user', req.user.email, `Completed ${session_type} session: ${session_name}`, 'wellness_session', result.insertId, {});
    res.json({ message: 'Session recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Daily wellness checklist (sample)
const defaultChecklist = [
  { id: 1, label: 'Drink 8 glasses of water', checked: false },
  { id: 2, label: 'Get at least 15 minutes of sunshine', checked: false },
  { id: 3, label: 'Practice gratitude (list 3 things)', checked: false },
  { id: 4, label: 'Move your body (walk, stretch, etc.)', checked: false },
  { id: 5, label: 'Take 3 deep breaths', checked: false },
  { id: 6, label: 'Connect with someone you care about', checked: false },
];

exports.getDailyWellness = (req, res) => {
  res.json(defaultChecklist);
};

exports.saveDailyWellness = (req, res) => {
  res.json({ message: 'Progress saved' });
};
