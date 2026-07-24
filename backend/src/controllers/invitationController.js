const pool = require('../config/db');
const crypto = require('crypto');
const { logAuditAction } = require('../services/auditLogService');

// @desc    Admin: Send invitation
// @route   POST /api/admin/invitations
exports.sendInvitation = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !['professional','volunteer','org_admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid email and role required' });
    }
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists. You can assign role manually.' });
    }
    // Check for pending invitation
    const [inv] = await pool.query(
      'SELECT id FROM invitations WHERE email = ? AND status = "pending"',
      [email]
    );
    if (inv.length > 0) {
      return res.status(409).json({ error: 'An invitation already pending for this email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      `INSERT INTO invitations (email, role, token, invited_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [email, role, token, req.user.id, expiresAt]
    );
    // Send email (placeholder – log to console)
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?invite=${token}`;
    console.log(`📧 Invitation sent to ${email} for role ${role}: ${inviteLink}`);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Sent invitation to ${email} for ${role}`, 'invitation', null);
    res.json({ message: 'Invitation sent.', inviteLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Public: Validate invitation token
// @route   GET /api/invitations/validate?token=...
exports.validateInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const [rows] = await pool.query(
      'SELECT email, role FROM invitations WHERE token = ? AND status = "pending" AND expires_at > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invitation token.' });
    }
    res.json({ email: rows[0].email, role: rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Accept invitation (after registration)
// @route   POST /api/invitations/accept
exports.acceptInvitation = async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token || !userId) return res.status(400).json({ error: 'Token and user ID required' });
    const [rows] = await pool.query(
      'SELECT email, role FROM invitations WHERE token = ? AND status = "pending" AND expires_at > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invitation token.' });
    }
    // Update user role
    const { role } = rows[0];
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    // If role is professional, create professional record
    if (role === 'professional') {
      await pool.query(
        `INSERT INTO professionals (user_id, is_verified)
         VALUES (?, 1)`,
        [userId]
      );
    } else if (role === 'volunteer') {
      await pool.query(
        `INSERT INTO volunteer_listeners (user_id, is_verified, is_online)
         VALUES (?, 1, 0)`,
        [userId]
      );
    }
    // Mark invitation as accepted
    await pool.query('UPDATE invitations SET status = "accepted" WHERE token = ?', [token]);
    res.json({ message: 'Invitation accepted. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};