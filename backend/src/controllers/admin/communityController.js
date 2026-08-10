const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.title, p.content, p.is_pinned, p.created_at, p.view_count, p.is_anonymous,
             u.email, u.first_name, u.last_name,
             c.name as category
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      ORDER BY p.is_pinned DESC, p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const [postRows] = await pool.query(`
      SELECT p.*, u.first_name, u.last_name, u.email,
             c.name as category_name
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    if (postRows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const post = postRows[0];
    post.author_name = post.is_anonymous
      ? post.anonymous_display_name || 'Anonymous'
      : `${post.first_name || ''} ${post.last_name || ''}`.trim() || 'Unknown';

    // Get comments
    const [comments] = await pool.query(`
      SELECT c.id, c.content, c.created_at, c.is_anonymous, c.anonymous_display_name,
             u.first_name, u.last_name, u.email
      FROM forum_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [id]);
    const formattedComments = comments.map(c => ({
      ...c,
      author_name: c.is_anonymous
        ? c.anonymous_display_name || 'Anonymous'
        : `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
    }));

    // Reaction counts
    const [reactions] = await pool.query(`
      SELECT reaction_type, COUNT(*) as count
      FROM post_reactions
      WHERE post_id = ?
      GROUP BY reaction_type
    `, [id]);
    const reactionCounts = {};
    reactions.forEach(r => reactionCounts[r.reaction_type] = r.count);

    res.json({ post, comments: formattedComments, reaction_counts: reactionCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM forum_posts WHERE id = ?', [id]);
    await logAuditAction(req.user.id, `Deleted community post ${id}`, 'forum_post', id, {}, req.user.email);
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
    await pool.query('UPDATE forum_posts SET is_pinned = ? WHERE id = ?', [is_pinned ? 1 : 0, id]);
    await logAuditAction(req.user.id, `${is_pinned ? 'Pinned' : 'Unpinned'} post ${id}`, 'forum_post', id, {}, req.user.email);
    res.json({ message: 'Post updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM forum_comments WHERE id = ?', [id]);
    await logAuditAction(req.user.id, `Deleted comment ${id}`, 'forum_comment', id, {}, req.user.email);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
