const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

// Get all organizations
exports.getOrganizations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.name, o.type, o.contact_email, o.contact_phone, o.domain,
             COUNT(uo.user_id) as member_count,
             o.created_at
      FROM organizations o
      LEFT JOIN user_organizations uo ON o.id = uo.organization_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, type, contact_email, contact_phone, domain } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const [result] = await pool.query(`
      INSERT INTO organizations (name, type, contact_email, contact_phone, domain)
      VALUES (?, ?, ?, ?, ?)
    `, [name, type || 'ngo', contact_email || null, contact_phone || null, domain || null]);
    const orgId = result.insertId;

    await logAuditAction(req.user.id, 'admin', req.user.email, `Created organization ${name}`, 'organization', orgId);
    res.status(201).json({ id: orgId, message: 'Organization created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add member to organization
exports.addMember = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Find user by email
    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userRows[0].id;

    // Check if already added
    const [existing] = await pool.query(
      'SELECT id FROM user_organizations WHERE user_id = ? AND organization_id = ?',
      [userId, orgId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already in organization' });
    }

    await pool.query(
      'INSERT INTO user_organizations (user_id, organization_id, role) VALUES (?, ?, ?)',
      [userId, orgId, role]
    );
    await logAuditAction(req.user.id, 'admin', req.user.email, `Added user ${userId} to org ${orgId}`, 'organization', orgId, { role });
    res.json({ message: 'Member added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const { orgId, userId } = req.params;
    await pool.query(
      'DELETE FROM user_organizations WHERE organization_id = ? AND user_id = ?',
      [orgId, userId]
    );
    await logAuditAction(req.user.id, 'admin', req.user.email, `Removed user ${userId} from org ${orgId}`, 'organization', orgId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};