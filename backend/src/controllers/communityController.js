const pool = require('../config/db');
const { generateAnonymousName } = require('../utils/anonymousNames');
const { logAuditAction } = require('../services/auditLogService');

// ===== Categories =====
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, slug FROM forum_categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ===== Posts =====
exports.getPosts = async (req, res) => {
  try {
    const { category, sort = 'recent', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ['p.is_pinned = 0']; // we'll fetch pinned separately
    const params = [];

    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }

    // Sort options: recent, popular, most_commented
    let orderBy = 'p.created_at DESC';
    if (sort === 'popular') orderBy = 'p.view_count DESC';
    else if (sort === 'most_commented') orderBy = 'comment_count DESC';

    const [rows] = await pool.query(`
      SELECT p.id, p.title, p.content, p.created_at, p.view_count,
             p.is_anonymous, p.anonymous_display_name,
             u.first_name, u.last_name,
             c.name as category_name,
             (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id) as reaction_count
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Format posts
    const posts = rows.map(p => ({
      ...p,
      author_name: p.is_anonymous ? p.anonymous_display_name || 'Anonymous' : `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
    }));

    // Get pinned posts (separate)
    const [pinned] = await pool.query(`
      SELECT p.id, p.title, p.created_at, p.is_anonymous, p.anonymous_display_name,
             u.first_name, u.last_name,
             c.name as category_name
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      WHERE p.is_pinned = 1
      ORDER BY p.created_at DESC
    `);
    const pinnedPosts = pinned.map(p => ({
      ...p,
      author_name: p.is_anonymous ? p.anonymous_display_name || 'Anonymous' : `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
    }));

    res.json({ posts, pinned: pinnedPosts, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single post with comments
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    // Increment view count
    await pool.query('UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?', [id]);

    const [postRows] = await pool.query(`
      SELECT p.*, u.first_name, u.last_name, c.name as category_name,
             (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id) as reaction_count
      FROM forum_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    if (postRows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const post = postRows[0];
    post.author_name = post.is_anonymous ? post.anonymous_display_name || 'Anonymous' : `${post.first_name || ''} ${post.last_name || ''}`.trim() || 'Unknown';

    // Get comments
    const [comments] = await pool.query(`
      SELECT c.id, c.content, c.created_at, c.is_anonymous, c.anonymous_display_name,
             u.first_name, u.last_name
      FROM forum_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [id]);
    const formattedComments = comments.map(c => ({
      ...c,
      author_name: c.is_anonymous ? c.anonymous_display_name || 'Anonymous' : `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
    }));

    // Get reactions for this post (grouped by type)
    const [reactions] = await pool.query(`
      SELECT reaction_type, COUNT(*) as count
      FROM post_reactions
      WHERE post_id = ?
      GROUP BY reaction_type
    `, [id]);
    const reactionCounts = {};
    reactions.forEach(r => reactionCounts[r.reaction_type] = r.count);

    // Get user's reactions if logged in
    let userReaction = null;
    if (req.user) {
      const [userReact] = await pool.query(`
        SELECT reaction_type FROM post_reactions
        WHERE user_id = ? AND post_id = ?
      `, [req.user.id, id]);
      if (userReact.length > 0) userReaction = userReact[0].reaction_type;
    }

    res.json({
      post,
      comments: formattedComments,
      reaction_counts: reactionCounts,
      user_reaction: userReaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new post (authenticated)
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, categoryId, isAnonymous = true } = req.body;
    if (!title || !content || !categoryId) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    let anonymousName = null;
    if (isAnonymous) {
      anonymousName = generateAnonymousName();
    }

    const [result] = await pool.query(`
      INSERT INTO forum_posts (user_id, category_id, title, content, is_anonymous, anonymous_display_name, is_pinned)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [userId, categoryId, title, content, isAnonymous, anonymousName]);

    await logAuditAction(
      userId,
      'user',
      req.user.email,
      `Created community post: ${title}`,
      'forum_post',
      result.insertId
    );

    res.status(201).json({ message: 'Post created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a comment
exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content, isAnonymous = true } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content is required' });

    // Check if post exists
    const [post] = await pool.query('SELECT id FROM forum_posts WHERE id = ?', [postId]);
    if (post.length === 0) return res.status(404).json({ error: 'Post not found' });

    let anonymousName = null;
    if (isAnonymous) {
      anonymousName = generateAnonymousName();
    }

    const [result] = await pool.query(`
      INSERT INTO forum_comments (post_id, user_id, content, is_anonymous, anonymous_display_name)
      VALUES (?, ?, ?, ?, ?)
    `, [postId, userId, content, isAnonymous, anonymousName]);

    await logAuditAction(
      userId,
      'user',
      req.user.email,
      `Commented on post ${postId}`,
      'forum_comment',
      result.insertId
    );

    res.status(201).json({ message: 'Comment added', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add reaction
exports.addReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { reaction } = req.body;
    const validReactions = ['like','love','support','insightful','helpful'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    // Check if already reacted with same type
    const [existing] = await pool.query(
      'SELECT id FROM post_reactions WHERE user_id = ? AND post_id = ? AND reaction_type = ?',
      [userId, postId, reaction]
    );
    if (existing.length > 0) {
      // Remove reaction (toggle)
      await pool.query('DELETE FROM post_reactions WHERE id = ?', [existing[0].id]);
      return res.json({ message: 'Reaction removed' });
    } else {
      // Add reaction
      await pool.query(
        'INSERT INTO post_reactions (user_id, post_id, reaction_type) VALUES (?, ?, ?)',
        [userId, postId, reaction]
      );
      return res.json({ message: 'Reaction added' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const [existing] = await pool.query('SELECT id FROM post_bookmarks WHERE user_id = ? AND post_id = ?', [userId, postId]);
    if (existing.length > 0) {
      await pool.query('DELETE FROM post_bookmarks WHERE id = ?', [existing[0].id]);
      return res.json({ message: 'Bookmark removed' });
    } else {
      await pool.query('INSERT INTO post_bookmarks (user_id, post_id) VALUES (?, ?)', [userId, postId]);
      return res.json({ message: 'Bookmark added' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Report content
exports.reportContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, targetId, reason } = req.body;
    if (!['post','comment'].includes(type)) return res.status(400).json({ error: 'Invalid target type' });
    if (!reason) return res.status(400).json({ error: 'Reason required' });

    await pool.query(`
      INSERT INTO reported_content (reporter_user_id, target_type, target_id, reason)
      VALUES (?, ?, ?, ?)
    `, [userId, type, targetId, reason]);

    await logAuditAction(
      userId,
      'user',
      req.user.email,
      `Reported ${type} ${targetId}`,
      type === 'post' ? 'forum_post' : 'forum_comment',
      targetId,
      { reason }
    );

    res.json({ message: 'Report submitted. Thank you for helping keep our community safe.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get bookmarks (for logged-in user)
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT p.id, p.title, p.created_at, p.is_anonymous, p.anonymous_display_name,
             u.first_name, u.last_name, c.name as category_name
      FROM post_bookmarks b
      JOIN forum_posts p ON b.post_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN forum_categories c ON p.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);
    const bookmarks = rows.map(p => ({
      ...p,
      author_name: p.is_anonymous ? p.anonymous_display_name || 'Anonymous' : `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
    }));
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};