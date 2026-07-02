const pool = require('../config/db');

// Get all journal entries for a user
exports.getEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, title, content, mood_at_entry, entry_type, word_count, is_favorite, created_at, updated_at
       FROM journal_entries
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

// Create new journal entry
exports.createEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, mood_at_entry, entry_type, is_favorite } = req.body;
    
    // Calculate word count (rough estimate)
    const wordCount = content ? content.trim().split(/\s+/).length : 0;

    const query = `
      INSERT INTO journal_entries 
      (user_id, title, content, mood_at_entry, entry_type, word_count, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await pool.query(query, [
      userId,
      title || null,
      content,
      mood_at_entry || null,
      entry_type || 'free',
      wordCount,
      is_favorite || false,
    ]);
    const id = result[0].insertId;
    res.status(201).json({ id, message: 'Entry created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update journal entry
exports.updateEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, mood_at_entry, entry_type, is_favorite } = req.body;

    // Calculate word count
    const wordCount = content ? content.trim().split(/\s+/).length : 0;

    const query = `
      UPDATE journal_entries
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          mood_at_entry = COALESCE(?, mood_at_entry),
          entry_type = COALESCE(?, entry_type),
          word_count = ?,
          is_favorite = COALESCE(?, is_favorite)
      WHERE id = ? AND user_id = ?
    `;
    await pool.query(query, [
      title || null,
      content || null,
      mood_at_entry || null,
      entry_type || null,
      wordCount,
      is_favorite !== undefined ? is_favorite : null,
      id,
      userId,
    ]);
    res.json({ message: 'Entry updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete entry (no changes needed)
exports.deleteEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM journal_entries WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};