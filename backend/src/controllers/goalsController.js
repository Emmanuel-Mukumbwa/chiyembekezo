const pool = require('../config/db');

// Get all goals for a user
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, title, description, target_date, status, progress, created_at, updated_at
       FROM goals
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, target_date, status, progress } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const query = `
      INSERT INTO goals (user_id, title, description, target_date, status, progress)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await pool.query(query, [
      userId,
      title,
      description || null,
      target_date || null,
      status || 'active',
      progress || 0,
    ]);
    const id = result[0].insertId;
    res.status(201).json({ id, message: 'Goal created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, target_date, status, progress } = req.body;

    const query = `
      UPDATE goals
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          target_date = COALESCE(?, target_date),
          status = COALESCE(?, status),
          progress = COALESCE(?, progress)
      WHERE id = ? AND user_id = ?
    `;
    await pool.query(query, [
      title || null,
      description || null,
      target_date || null,
      status || null,
      progress !== undefined ? progress : null,
      id,
      userId,
    ]);
    res.json({ message: 'Goal updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => { 
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};