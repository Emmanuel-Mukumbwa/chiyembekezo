const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getArticles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.slug, a.is_published, a.view_count, c.name as category,
             a.created_at
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.publishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    await pool.query('UPDATE articles SET is_published = ? WHERE id = ?', [is_published, id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Published article ${id}`, 'article', id, { is_published });
    res.json({ message: 'Article updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Deleted article ${id}`, 'article', id);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};