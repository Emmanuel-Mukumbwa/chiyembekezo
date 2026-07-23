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

// Get volunteer's support requests
exports.getVolunteerRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    // Check if user is a volunteer
    const [vol] = await pool.query('SELECT id FROM volunteer_listeners WHERE user_id = ?', [userId]);
    if (vol.length === 0) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }
    const listenerId = vol[0].id;
    const [rows] = await pool.query(`
      SELECT psr.id, psr.status, psr.message, psr.created_at,
             u.first_name, u.last_name, u.email
      FROM peer_support_requests psr
      JOIN users u ON psr.user_id = u.id
      WHERE psr.listener_id = ?
      ORDER BY psr.created_at DESC
    `, [listenerId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available (unassigned) requests for volunteers
exports.getAvailableRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT psr.id, psr.message, psr.created_at,
             u.first_name, u.last_name, u.email
      FROM peer_support_requests psr
      JOIN users u ON psr.user_id = u.id
      WHERE psr.listener_id IS NULL AND psr.status = 'pending'
      ORDER BY psr.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Claim a request (volunteer)
exports.claimRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    // Get volunteer listener ID
    const [vol] = await pool.query('SELECT id FROM volunteer_listeners WHERE user_id = ?', [userId]);
    if (vol.length === 0) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }
    const listenerId = vol[0].id;
    // Check if request exists and is pending
    const [reqRow] = await pool.query('SELECT id FROM peer_support_requests WHERE id = ? AND status = "pending" AND listener_id IS NULL', [id]);
    if (reqRow.length === 0) {
      return res.status(404).json({ error: 'Request not available' });
    }
    // Update
    await pool.query(
      'UPDATE peer_support_requests SET listener_id = ?, status = "accepted" WHERE id = ?',
      [listenerId, id]
    );
    res.json({ message: 'Request claimed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: get all requests with volunteer info
exports.adminGetRequests = async (req, res) => {
  try {
    const { status, volunteerId } = req.query;
    let query = `
      SELECT psr.id, psr.message, psr.created_at, psr.status,
             u.id as user_id, u.first_name as user_first, u.last_name as user_last,
             u.email as user_email,
             v.id as volunteer_id, vu.first_name as vol_first, vu.last_name as vol_last,
             vu.email as vol_email
      FROM peer_support_requests psr
      JOIN users u ON psr.user_id = u.id
      LEFT JOIN volunteer_listeners v ON psr.listener_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ' AND psr.status = ?';
      params.push(status);
    }
    if (volunteerId) {
      query += ' AND v.id = ?';
      params.push(volunteerId);
    }
    query += ' ORDER BY psr.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: assign a volunteer to a request
exports.adminAssignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;
    if (!volunteerId) {
      return res.status(400).json({ error: 'Volunteer ID required' });
    }
    // Check volunteer exists and is verified
    const [vol] = await pool.query('SELECT id FROM volunteer_listeners WHERE id = ? AND is_verified = 1', [volunteerId]);
    if (vol.length === 0) {
      return res.status(404).json({ error: 'Verified volunteer not found' });
    }
    // Check request exists and is pending
    const [reqRow] = await pool.query('SELECT id FROM peer_support_requests WHERE id = ? AND status = "pending"', [id]);
    if (reqRow.length === 0) {
      return res.status(404).json({ error: 'Request not found or not pending' });
    }
    await pool.query(
      'UPDATE peer_support_requests SET listener_id = ?, status = "accepted" WHERE id = ?',
      [volunteerId, id]
    );
    await logAuditAction(req.user.id, 'admin', req.user.email, `Assigned volunteer ${volunteerId} to request ${id}`, 'peer_support', id, { volunteerId });
    res.json({ message: 'Volunteer assigned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: unassign volunteer (set listener_id = NULL, status = pending)
exports.adminUnassignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE peer_support_requests SET listener_id = NULL, status = "pending" WHERE id = ?',
      [id]
    );
    await logAuditAction(req.user.id, 'admin', req.user.email, `Unassigned volunteer from request ${id}`, 'peer_support', id);
    res.json({ message: 'Volunteer unassigned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};