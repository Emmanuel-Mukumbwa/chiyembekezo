const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

// GET all emergency contacts (admin)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, phone, organization, district, contact_type, is_active, is_featured
      FROM emergency_contacts
      ORDER BY contact_type, name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// CREATE emergency contact
exports.create = async (req, res) => {
  try {
    const { name, phone, organization, district, contact_type, is_featured } = req.body;
    if (!name || !phone || !contact_type) {
      return res.status(400).json({ error: 'Name, phone, and contact type are required' });
    }
    const [result] = await pool.query(`
      INSERT INTO emergency_contacts (name, phone, organization, district, contact_type, is_featured)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, phone, organization || null, district || null, contact_type, is_featured || false]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Created emergency contact: ${name}`, 'emergency', result.insertId);
    res.status(201).json({ message: 'Emergency contact created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE emergency contact
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, organization, district, contact_type, is_active, is_featured } = req.body;
    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (organization !== undefined) { updates.push('organization = ?'); params.push(organization); }
    if (district !== undefined) { updates.push('district = ?'); params.push(district); }
    if (contact_type !== undefined) { updates.push('contact_type = ?'); params.push(contact_type); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    if (is_featured !== undefined) { updates.push('is_featured = ?'); params.push(is_featured); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    await pool.query(`UPDATE emergency_contacts SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Updated emergency contact ${id}`, 'emergency', id);
    res.json({ message: 'Emergency contact updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE emergency contact
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM emergency_contacts WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'admin', req.user.email, `Deleted emergency contact ${id}`, 'emergency', id);
    res.json({ message: 'Emergency contact deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
