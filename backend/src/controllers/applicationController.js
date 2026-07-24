const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// @desc    Submit application (authenticated user)
// @route   POST /api/applications
exports.submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, message, qualifications, experience, specialization, license_number, languages, availability } = req.body;
    if (!type || !['professional','volunteer'].includes(type)) {
      return res.status(400).json({ error: 'Valid application type required' });
    }
    // Check if user already has pending application
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND type = ? AND status = "pending"',
      [userId, type]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You already have a pending application for this role.' });
    }
    await pool.query(
      `INSERT INTO applications 
       (user_id, type, message, qualifications, experience, specialization, license_number, languages, availability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, message || null, qualifications || null, experience || null, specialization || null, license_number || null, languages || null, availability || null]
    );
    await logAuditAction(userId, 'user', req.user.email, `Submitted application for ${type}`, 'application', null);
    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get user's own applications
// @route   GET /api/applications/my
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, type, status, message, qualifications, experience, specialization, license_number, languages, availability, created_at, updated_at
       FROM applications
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

// @desc    Admin: Get all applications
// @route   GET /api/admin/applications
exports.adminGetApplications = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = `
      SELECT a.id, a.type, a.status, a.message, a.qualifications, a.experience,
             a.specialization, a.license_number, a.languages, a.availability,
             a.created_at,
             u.id as user_id, u.email, u.first_name, u.last_name, u.phone
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }
    query += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.query(query, params);
    // Parse JSON fields
    const applications = rows.map(a => ({
      ...a,
      languages: a.languages ? JSON.parse(a.languages) : [],
    }));
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Admin: Review application (approve/reject)
// @route   PUT /api/admin/applications/:id
exports.adminReviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;
    if (!['approved','rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }
    // Get application
    const [app] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
    if (app.length === 0) return res.status(404).json({ error: 'Application not found' });
    const application = app[0];
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application already reviewed' });
    }

    // Update application
    await pool.query(
      'UPDATE applications SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [status, req.user.id, id]
    );

    // If approved, promote user
    if (status === 'approved') {
      const userId = application.user_id;
      if (application.type === 'professional') {
        // Update user role
        await pool.query('UPDATE users SET role = "professional", is_professional = 1 WHERE id = ?', [userId]);
        // Create professional record (basic)
        await pool.query(
          `INSERT INTO professionals (user_id, specialization, license_number, languages, is_verified)
           VALUES (?, ?, ?, ?, 1)`,
          [userId, application.specialization, application.license_number, application.languages || '[]']
        );
      } else if (application.type === 'volunteer') {
        // Update user role
        await pool.query('UPDATE users SET role = "volunteer" WHERE id = ?', [userId]);
        // Create volunteer listener record
        await pool.query(
          `INSERT INTO volunteer_listeners (user_id, is_verified, available_languages, bio, is_online)
           VALUES (?, 1, ?, ?, 0)`,
          [userId, application.languages || '[]', application.experience || '']
        );
      }
      await logAuditAction(req.user.id, 'admin', req.user.email, `Approved application ${id} for ${application.type}`, 'application', id);
    } else {
      await logAuditAction(req.user.id, 'admin', req.user.email, `Rejected application ${id} for ${application.type}`, 'application', id);
    }

    res.json({ message: `Application ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};