const pool = require('../config/db');
const { checkAndAwardAchievements } = require('../services/achievementService');

// ===== Resources =====
exports.getResources = async (req, res) => {
  try {
    const { type, category, search, featured, limit = 12, page = 1 } = req.query;
    let conditions = ['r.is_published = 1'];
    const params = [];
    const offset = (page - 1) * parseInt(limit);

    if (type) {
      conditions.push('r.type = ?');
      params.push(type);
    }
    if (category) {
      conditions.push('r.category_id = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.tags LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      conditions.push('r.is_featured = 1');
    }

    const query = `
      SELECT r.id, r.title, r.type, r.url, r.description, r.content,
             r.duration_minutes, r.file_size, r.author, r.tags,
             r.is_featured, r.view_count, r.like_count,
             c.name as category_name, c.id as category_id, c.slug as category_slug,
             r.created_at
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.is_featured DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit), offset]);

    // Parse tags JSON
    const resources = rows.map(r => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM resources r
      WHERE ${conditions.join(' AND ')}
    `;
    const [countRows] = await pool.query(countQuery, params);

    res.json({
      resources,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countRows[0].total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    // Increment view count
    await pool.query('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [id]);

    const [rows] = await pool.query(`
      SELECT r.id, r.title, r.type, r.url, r.description, r.content,
             r.duration_minutes, r.file_size, r.author, r.tags,
             r.is_featured, r.view_count, r.like_count,
             c.name as category_name, c.id as category_id,
             r.created_at
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    const resource = rows[0];
    resource.tags = resource.tags ? JSON.parse(resource.tags) : [];
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, slug, description,
             (SELECT COUNT(*) FROM resources WHERE category_id = c.id AND is_published = 1) as resource_count
      FROM categories c
      ORDER BY name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'
    if (action === 'like') {
      await pool.query('UPDATE resources SET like_count = like_count + 1 WHERE id = ?', [id]);
    } else {
      await pool.query('UPDATE resources SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [id]);
    }
    res.json({ message: 'Like toggled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ===== Courses =====
exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT resource_id, progress_percent, completed FROM course_progress WHERE user_id = ?',
      [userId]
    );
    const map = {};
    rows.forEach(r => map[r.resource_id] = r);
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { progress } = req.body;
    const completed = progress >= 100;

    // Get previous progress to detect start
    const [prev] = await pool.query(
      'SELECT progress_percent, completed FROM course_progress WHERE user_id = ? AND resource_id = ?',
      [userId, id]
    );
    const wasStarted = prev.length > 0 && prev[0].progress_percent > 0;
    const wasCompleted = prev.length > 0 && prev[0].completed;

    await pool.query(`
      INSERT INTO course_progress (user_id, resource_id, progress_percent, completed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        progress_percent = VALUES(progress_percent),
        completed = VALUES(completed),
        last_accessed_at = CURRENT_TIMESTAMP
    `, [userId, id, progress, completed]);

    // Award achievements
    if (!wasStarted && progress > 0) {
      await checkAndAwardAchievements(userId, 'course_start');
    }
    if (!wasCompleted && completed) {
      await checkAndAwardAchievements(userId, 'course_complete');
    }

    res.json({ message: 'Progress updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ===== Quizzes =====
exports.getQuizzes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT q.id, q.title, q.description, q.passing_score,
             c.name as category_name,
             (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempts
      FROM quizzes q
      LEFT JOIN categories c ON q.category_id = c.id
      ORDER BY q.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT q.*, c.name as category_name
      FROM quizzes q
      LEFT JOIN categories c ON q.category_id = c.id
      WHERE q.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = rows[0];
    // Parse questions
    quiz.questions = quiz.questions ? JSON.parse(quiz.questions) : [];
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { answers } = req.body;

    // Fetch quiz
    const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = rows[0];
    const questions = JSON.parse(quiz.questions);

    let correct = 0;
    const total = questions.length;
    // Compare answers
    for (let i = 0; i < total; i++) {
      if (answers[i] === questions[i].correct_answer_index) {
        correct++;
      }
    }
    const score = Math.round((correct / total) * 100);
    const passed = score >= quiz.passing_score;

    // Save attempt
    await pool.query(`
      INSERT INTO quiz_attempts (user_id, quiz_id, score, passed, answers)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, id, score, passed, JSON.stringify(answers)]);

    // Award achievement if passed
    if (passed) {
      await checkAndAwardAchievements(userId, 'quiz_pass');
    }

    res.json({ score, passed, correct, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserQuizProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT quiz_id, score, passed, completed_at
      FROM quiz_attempts
      WHERE user_id = ?
      ORDER BY completed_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};