const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

// Get all organizations
exports.getOrganizations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.name, o.type, o.contact_email, o.contact_phone, o.domain,
             COUNT(uo.user_id) as member_count,
             o.is_active, o.created_at
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

// Get members of a specific organization
exports.getMembers = async (req, res) => {
  try {
    const { orgId } = req.params;
    const [rows] = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, uo.role, uo.created_at as joined_at
      FROM user_organizations uo
      JOIN users u ON u.id = uo.user_id
      WHERE uo.organization_id = ?
      ORDER BY uo.created_at DESC
    `, [orgId]);
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
      INSERT INTO organizations (name, type, contact_email, contact_phone, domain, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [name, type || 'ngo', contact_email || null, contact_phone || null, domain || null]);
    const orgId = result.insertId;

    await logAuditAction(req.user.id, `Created organization ${name}`, 'organization', orgId, {}, req.user.email);
    res.status(201).json({ id: orgId, message: 'Organization created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update organization details
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, contact_email, contact_phone, domain, is_active } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (contact_email !== undefined) { updates.push('contact_email = ?'); params.push(contact_email); }
    if (contact_phone !== undefined) { updates.push('contact_phone = ?'); params.push(contact_phone); }
    if (domain !== undefined) { updates.push('domain = ?'); params.push(domain); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    await pool.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAuditAction(req.user.id, `Updated organization ${id}`, 'organization', id, {}, req.user.email);
    res.json({ message: 'Organization updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Toggle active status
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT is_active FROM organizations WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE organizations SET is_active = ? WHERE id = ?', [newStatus, id]);
    await logAuditAction(req.user.id, `${newStatus ? 'Activated' : 'Deactivated'} organization ${id}`, 'organization', id, {}, req.user.email);
    res.json({ message: `Organization ${newStatus ? 'activated' : 'deactivated'}` });
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

    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userRows[0].id;

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
    await logAuditAction(req.user.id, `Added user ${userId} to org ${orgId}`, 'organization', orgId, { role }, req.user.email);
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
    await logAuditAction(req.user.id, `Removed user ${userId} from org ${orgId}`, 'organization', orgId, {}, req.user.email);
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
