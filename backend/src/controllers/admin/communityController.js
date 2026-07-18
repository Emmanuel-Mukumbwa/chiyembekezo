const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.title, p.created_at, p.is_anonymous, p.is_pinned,
             u.email, c.name as category
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM forum_posts WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Deleted forum post ${id}`, 'forum_post', id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.pinPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_pinned } = req.body;
    await pool.query('UPDATE forum_posts SET is_pinned = ? WHERE id = ?', [is_pinned, id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Pinned forum post ${id}`, 'forum_post', id, { is_pinned });
    res.json({ message: 'Post updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};