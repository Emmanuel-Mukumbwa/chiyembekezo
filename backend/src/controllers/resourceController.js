const pool = require('../config/db');

// ---- GET /resources (public, with search, filters, pagination) ----
exports.getResources = async (req, res) => {
  try {
    const { search, category, type, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['r.is_published = 1'];
    const params = [];

    if (search) {
      conditions.push('(r.title LIKE ? OR r.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('r.category_id = ?');
      params.push(category);
    }
    if (type) {
      conditions.push('r.type = ?');
      params.push(type);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM resources r ${where}`, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT r.id, r.title, r.slug, r.type, r.url, r.description, r.category_id,
              r.is_published, r.is_featured, r.view_count, r.like_count,
              r.duration_minutes, r.file_size, r.author, r.tags,
              c.name as category_name
       FROM resources r
       LEFT JOIN categories c ON r.category_id = c.id
       ${where}
       ORDER BY r.is_featured DESC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Parse tags JSON
    const resources = rows.map(r => ({
      ...r,
      tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
    }));

    res.json({
      resources,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- GET /resources/categories (public) ----
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, slug FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- GET /resources/:id (public detail) ----
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, c.name as category_name
       FROM resources r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.id = ? AND r.is_published = 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Resource not found' });

    // Increment view count
    await pool.query('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [id]);

    const resource = rows[0];
    // Parse tags if JSON string
    if (resource.tags) {
      try {
        resource.tags = typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags;
      } catch {
        resource.tags = [];
      }
    } else {
      resource.tags = [];
    }

    // Fetch user progress if user is logged in (optional)
    // We'll include it in the response if available
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- POST /resources/user/course-progress/:id (authenticated) ----
exports.updateCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.id;
    const { progress } = req.body;

    // Check if resource is a course
    const [resource] = await pool.query('SELECT type FROM resources WHERE id = ?', [resourceId]);
    if (!resource.length || resource[0].type !== 'course') {
      return res.status(400).json({ error: 'Resource is not a course' });
    }

    await pool.query(
      `INSERT INTO course_progress (user_id, resource_id, progress_percent, completed)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE progress_percent = ?, completed = ?`,
      [userId, resourceId, progress, progress >= 100, progress, progress >= 100]
    );
    res.json({ message: 'Progress updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- GET /resources/user/course-progress (authenticated) ----
exports.getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT resource_id, progress_percent FROM course_progress WHERE user_id = ?',
      [userId]
    );
    const progress = {};
    rows.forEach(r => progress[r.resource_id] = r.progress_percent);
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- POST /resources/:id/like (authenticated) ----
exports.toggleLike = async (req, res) => {
  try {
    // Simple increment/decrement for now
    const { action } = req.body;
    const { id } = req.params;
    if (action === 'like') {
      await pool.query('UPDATE resources SET like_count = like_count + 1 WHERE id = ?', [id]);
    } else if (action === 'unlike') {
      await pool.query('UPDATE resources SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [id]);
    }
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- Quiz stubs (placeholder) ----
exports.getQuizzes = (req, res) => {
  res.json([]);
};

exports.getQuizById = (req, res) => {
  res.status(404).json({ error: 'Quiz not found' });
};

exports.submitQuiz = (req, res) => {
  res.json({ message: 'Quiz submission not implemented yet' });
};

exports.getUserQuizProgress = (req, res) => {
  res.json({});
};

// Alias for route that uses getCourseProgress instead of getUserCourseProgress
exports.getCourseProgress = exports.getUserCourseProgress;
