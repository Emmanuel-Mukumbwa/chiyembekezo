const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getResources = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.title, r.type, r.is_published, r.view_count,
             c.name as category, r.created_at
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.publishResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    await pool.query('UPDATE resources SET is_published = ? WHERE id = ?', [is_published, id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Published resource ${id}`, 'resource', id, { is_published });
    res.json({ message: 'Resource updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM resources WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Deleted resource ${id}`, 'resource', id);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};