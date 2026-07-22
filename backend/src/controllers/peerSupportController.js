const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// Get available volunteer listeners (verified + online)
exports.getAvailableListeners = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.id, u.first_name, u.last_name, v.bio, v.available_languages
      FROM volunteer_listeners v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_verified = 1 AND v.is_online = 1
      ORDER BY v.created_at ASC
    `);
    const listeners = rows.map(v => ({
      ...v,
      available_languages: v.available_languages ? JSON.parse(v.available_languages) : [],
    }));
    res.json(listeners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a peer support request
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listenerId, message } = req.body;
    if (!listenerId || !message) {
      return res.status(400).json({ error: 'Listener and message required' });
    }
    const [result] = await pool.query(`
      INSERT INTO peer_support_requests (user_id, listener_id, message, status)
      VALUES (?, ?, ?, 'pending')
    `, [userId, listenerId, message]);
    await logAuditAction(userId, 'user', req.user.email, 'Requested peer support', 'peer_support', result.insertId, { listenerId });
    res.status(201).json({ id: result.insertId, message: 'Request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT r.*, u.first_name, u.last_name
      FROM peer_support_requests r
      LEFT JOIN volunteer_listeners v ON r.listener_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};