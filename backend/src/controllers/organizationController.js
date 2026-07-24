const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAuditAction } = require('../services/auditLogService');

// Get current organization info (protected – org admin only)
exports.getOrganizationInfo = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const [rows] = await pool.query(`
      SELECT id, name, type, contact_email, contact_phone, domain
      FROM organizations WHERE id = ?
    `, [orgId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get aggregated stats for the organization (protected – org admin only)
exports.getStats = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { period = 'month' } = req.query;
    let dateCondition;
    switch (period) {
      case 'quarter': dateCondition = "DATE_SUB(NOW(), INTERVAL 3 MONTH)"; break;
      case 'year': dateCondition = "DATE_SUB(NOW(), INTERVAL 1 YEAR)"; break;
      default: dateCondition = "DATE_SUB(NOW(), INTERVAL 1 MONTH)"; break;
    }

    const [users] = await pool.query(`
      SELECT u.id
      FROM users u
      JOIN user_organizations uo ON u.id = uo.user_id
      WHERE uo.organization_id = ? AND u.role != 'org_admin'
    `, [orgId]);
    const userIds = users.map(u => u.id);
    if (userIds.length === 0) {
      return res.json({
        total_members: 0,
        mood_avg: 0,
        stress_avg: 0,
        sleep_avg: 0,
        assessment_count: 0,
        journal_count: 0,
        wellness_sessions: 0,
        top_wellness_types: [],
        mood_distribution: [],
        resource_usage: 0,
        engagement_rate: 0,
      });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const params = [...userIds];

    const [moodResult] = await pool.query(`
      SELECT AVG(mood_score) as mood_avg, AVG(stress_level) as stress_avg, AVG(sleep_hours) as sleep_avg
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
    `, params);

    const [assessmentResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM assessment_results ar
      JOIN assessment_types at ON ar.assessment_type_id = at.id
      WHERE ar.user_id IN (${placeholders}) AND ar.taken_at >= ${dateCondition}
    `, params);

    const [journalResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM journal_entries
      WHERE user_id IN (${placeholders}) AND created_at >= ${dateCondition}
    `, params);

    const [wellnessResult] = await pool.query(`
      SELECT COUNT(*) as count, session_type
      FROM wellness_sessions
      WHERE user_id IN (${placeholders}) AND completed = TRUE AND created_at >= ${dateCondition}
      GROUP BY session_type
    `, params);

    const [moodDist] = await pool.query(`
      SELECT mood_score, COUNT(*) as count
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
      GROUP BY mood_score
    `, params);

    const [resourceResult] = await pool.query(`
      SELECT COUNT(DISTINCT resource_id) as count
      FROM course_progress
      WHERE user_id IN (${placeholders}) AND last_accessed_at >= ${dateCondition}
    `, params);

    const [engagementResult] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
    `, params);

    const totalMembers = userIds.length;
    const engagedMembers = engagementResult[0]?.count || 0;
    const engagementRate = totalMembers > 0 ? (engagedMembers / totalMembers) * 100 : 0;
    const topWellness = wellnessResult.map(w => ({ type: w.session_type, count: w.count }));

    res.json({
      total_members: totalMembers,
      mood_avg: moodResult[0]?.mood_avg ? parseFloat(moodResult[0].mood_avg).toFixed(2) : 0,
      stress_avg: moodResult[0]?.stress_avg ? parseFloat(moodResult[0].stress_avg).toFixed(2) : 0,
      sleep_avg: moodResult[0]?.sleep_avg ? parseFloat(moodResult[0].sleep_avg).toFixed(2) : 0,
      assessment_count: assessmentResult[0]?.count || 0,
      journal_count: journalResult[0]?.count || 0,
      wellness_sessions: wellnessResult.reduce((sum, w) => sum + w.count, 0),
      top_wellness_types: topWellness,
      mood_distribution: moodDist.map(d => ({ mood_score: d.mood_score, count: d.count })),
      resource_usage: resourceResult[0]?.count || 0,
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get organization members (protected – org admin only)
exports.getMembers = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const [rows] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.created_at
      FROM users u
      JOIN user_organizations uo ON u.id = uo.user_id
      WHERE uo.organization_id = ? AND u.role != 'org_admin'
      ORDER BY u.created_at DESC
    `, [orgId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get organization insights (protected – org admin only)
exports.getInsights = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { period = 'month' } = req.query;
    let dateCondition;
    switch (period) {
      case 'quarter': dateCondition = "DATE_SUB(NOW(), INTERVAL 3 MONTH)"; break;
      case 'year': dateCondition = "DATE_SUB(NOW(), INTERVAL 1 YEAR)"; break;
      default: dateCondition = "DATE_SUB(NOW(), INTERVAL 1 MONTH)"; break;
    }

    const [users] = await pool.query(`
      SELECT u.id
      FROM users u
      JOIN user_organizations uo ON u.id = uo.user_id
      WHERE uo.organization_id = ? AND u.role != 'org_admin'
    `, [orgId]);
    const userIds = users.map(u => u.id);
    if (userIds.length === 0) {
      return res.json({
        total_members: 0,
        mood_avg: 0,
        stress_avg: 0,
        sleep_avg: 0,
        assessment_count: 0,
        journal_count: 0,
        wellness_sessions: 0,
        top_wellness_types: [],
        mood_distribution: [],
        resource_usage: 0,
        engagement_rate: 0,
      });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const params = [...userIds];

    const [moodResult] = await pool.query(`
      SELECT AVG(mood_score) as mood_avg, AVG(stress_level) as stress_avg, AVG(sleep_hours) as sleep_avg
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
    `, params);

    const [assessmentResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM assessment_results ar
      JOIN assessment_types at ON ar.assessment_type_id = at.id
      WHERE ar.user_id IN (${placeholders}) AND ar.taken_at >= ${dateCondition}
    `, params);

    const [journalResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM journal_entries
      WHERE user_id IN (${placeholders}) AND created_at >= ${dateCondition}
    `, params);

    const [wellnessResult] = await pool.query(`
      SELECT COUNT(*) as count, session_type
      FROM wellness_sessions
      WHERE user_id IN (${placeholders}) AND completed = TRUE AND created_at >= ${dateCondition}
      GROUP BY session_type
    `, params);

    const [moodDist] = await pool.query(`
      SELECT mood_score, COUNT(*) as count
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
      GROUP BY mood_score
    `, params);

    const [resourceResult] = await pool.query(`
      SELECT COUNT(DISTINCT resource_id) as count
      FROM course_progress
      WHERE user_id IN (${placeholders}) AND last_accessed_at >= ${dateCondition}
    `, params);

    const [engagementResult] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM mood_entries
      WHERE user_id IN (${placeholders}) AND recorded_at >= ${dateCondition}
    `, params);

    const totalMembers = userIds.length;
    const engagedMembers = engagementResult[0]?.count || 0;
    const engagementRate = totalMembers > 0 ? (engagedMembers / totalMembers) * 100 : 0;
    const topWellness = wellnessResult.map(w => ({ type: w.session_type, count: w.count }));

    res.json({
      total_members: totalMembers,
      mood_avg: moodResult[0]?.mood_avg ? parseFloat(moodResult[0].mood_avg).toFixed(2) : 0,
      stress_avg: moodResult[0]?.stress_avg ? parseFloat(moodResult[0].stress_avg).toFixed(2) : 0,
      sleep_avg: moodResult[0]?.sleep_avg ? parseFloat(moodResult[0].sleep_avg).toFixed(2) : 0,
      assessment_count: assessmentResult[0]?.count || 0,
      journal_count: journalResult[0]?.count || 0,
      wellness_sessions: wellnessResult.reduce((sum, w) => sum + w.count, 0),
      top_wellness_types: topWellness,
      mood_distribution: moodDist.map(d => ({ mood_score: d.mood_score, count: d.count })),
      resource_usage: resourceResult[0]?.count || 0,
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add member to organization (protected – org admin only)
exports.addMember = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const adminId = req.user.id;
    const { email, firstName, lastName, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      const userId = existing[0].id;
      const [already] = await pool.query(
        'SELECT id FROM user_organizations WHERE user_id = ? AND organization_id = ?',
        [userId, orgId]
      );
      if (already.length === 0) {
        await pool.query(
          'INSERT INTO user_organizations (user_id, organization_id, role) VALUES (?, ?, ?)',
          [userId, orgId, role]
        );
        await logAuditAction(adminId, 'org_admin', req.user.email, `Added member ${email} to organization`, 'org_member', userId);
        return res.json({ message: 'Member added to organization.' });
      } else {
        return res.json({ message: 'User is already a member.' });
      }
    } else {
      const tempPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(tempPassword, salt);
      const [result] = await pool.query(
        'INSERT INTO users (email, first_name, last_name, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [email, firstName || null, lastName || null, hashed, 'org_member', 1]
      );
      const userId = result.insertId;
      await pool.query(
        'INSERT INTO user_organizations (user_id, organization_id, role) VALUES (?, ?, ?)',
        [userId, orgId, role]
      );
      await logAuditAction(adminId, 'org_admin', req.user.email, `Created member ${email} in organization`, 'org_member', userId);
      return res.json({ message: 'Member created and added to organization.', tempPassword });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update member (protected – org admin only)
exports.updateMember = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const adminId = req.user.id;
    const { memberId } = req.params;
    const { is_active, role } = req.body;

    const [member] = await pool.query(
      `SELECT u.id, u.role as system_role
       FROM users u
       JOIN user_organizations uo ON u.id = uo.user_id
       WHERE u.id = ? AND uo.organization_id = ? AND u.role != 'org_admin'`,
      [memberId, orgId]
    );
    if (member.length === 0) return res.status(404).json({ error: 'Member not found' });

    const updates = [];
    const params = [];
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    if (role && role !== 'org_admin') {
      updates.push('role = ?');
      params.push(role);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(memberId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAuditAction(adminId, 'org_admin', req.user.email, `Updated member ${memberId}`, 'org_member', memberId);
    res.json({ message: 'Member updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove member from organization (protected – org admin only)
exports.removeMember = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const adminId = req.user.id;
    const { memberId } = req.params;

    const [member] = await pool.query(
      `SELECT u.id
       FROM users u
       JOIN user_organizations uo ON u.id = uo.user_id
       WHERE u.id = ? AND uo.organization_id = ? AND u.role != 'org_admin'`,
      [memberId, orgId]
    );
    if (member.length === 0) return res.status(404).json({ error: 'Member not found' });

    await pool.query('DELETE FROM user_organizations WHERE user_id = ? AND organization_id = ?', [memberId, orgId]);
    await logAuditAction(adminId, 'org_admin', req.user.email, `Removed member ${memberId} from organization`, 'org_member', memberId);
    res.json({ message: 'Member removed from organization' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// **** PUBLIC ENDPOINT ****
// Get organization by ID (for registration page)
// @route   GET /api/organizations/:id
exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, name FROM organizations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};