const pool = require('../../config/db');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/upload');
const { logAuditAction } = require('../../services/auditLogService');

// ---- GET resources for organization ----
exports.getResources = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { search } = req.query;
    let query = `
      SELECT r.id, r.title, r.type, r.is_published, r.view_count,
             c.name as category, r.created_at
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.organization_id = ?
    `;
    const params = [orgId];
    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY r.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- GET single resource ----
exports.getResourceById = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, c.name as category_name
       FROM resources r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.id = ? AND r.organization_id = ?`,
      [id, orgId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    if (rows[0].tags) {
      try { rows[0].tags = JSON.parse(rows[0].tags); } catch (e) { rows[0].tags = []; }
    } else { rows[0].tags = []; }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- CREATE resource ----
exports.createResource = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const {
      title,
      slug,
      type,
      description,
      content,
      category_id,
      author,
      tags,
      is_published,
      duration_minutes,
      file_size,
    } = req.body;

    let url = req.body.url || null;

    if (req.files && req.files.file) {
      const resourceType = type === 'video' ? 'video' : type === 'audio' ? 'video' : 'auto';
      const result = await uploadToCloudinary(req.files.file.data, 'organization-resources', resourceType);
      url = result.secure_url;
    }

    const [result] = await pool.query(
      `INSERT INTO resources
       (title, slug, type, url, description, content, category_id, author, tags,
        is_published, duration_minutes, file_size, organization_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug || title.toLowerCase().replace(/\s+/g, '-'),
        type,
        url,
        description || null,
        content || null,
        category_id || null,
        author || null,
        tags ? JSON.stringify(tags) : null,
        is_published || 0,
        duration_minutes || null,
        file_size || null,
        orgId,
      ]
    );
    await logAuditAction(req.user.id, 'org_admin', req.user.email, `Created resource: ${title}`, 'resource', result.insertId);
    res.status(201).json({ message: 'Resource created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- UPDATE resource ----
exports.updateResource = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { id } = req.params;
    const {
      title,
      slug,
      type,
      description,
      content,
      category_id,
      author,
      tags,
      is_published,
      duration_minutes,
      file_size,
    } = req.body;

    const updates = [];
    const params = [];

    const [oldRows] = await pool.query('SELECT url, type FROM resources WHERE id = ? AND organization_id = ?', [id, orgId]);
    if (oldRows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    const oldResource = oldRows[0];

    let url = oldResource.url;

    if (req.files && req.files.file) {
      if (oldResource.url) {
        try {
          const parts = oldResource.url.split('/');
          const fileName = parts[parts.length - 1];
          const publicId = fileName.split('.')[0];
          const folder = parts[parts.length - 2] === 'organization-resources' ? 'organization-resources' : 'organization-resources';
          await deleteFromCloudinary(`chiyembekezo/${folder}/${publicId}`, 'image');
        } catch (delErr) {
          console.warn('Could not delete old file:', delErr);
        }
      }
      const resourceType = type === 'video' ? 'video' : type === 'audio' ? 'video' : 'auto';
      const result = await uploadToCloudinary(req.files.file.data, 'organization-resources', resourceType);
      url = result.secure_url;
      updates.push('url = ?');
      params.push(url);
    }

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id); }
    if (author !== undefined) { updates.push('author = ?'); params.push(author); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (is_published !== undefined) { updates.push('is_published = ?'); params.push(is_published); }
    if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); params.push(duration_minutes); }
    if (file_size !== undefined) { updates.push('file_size = ?'); params.push(file_size); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    params.push(id);
    await pool.query(`UPDATE resources SET ${updates.join(', ')} WHERE id = ? AND organization_id = ?`, [...params, orgId]);

    await logAuditAction(req.user.id, 'org_admin', req.user.email, `Updated resource ${id}`, 'resource', id);
    res.json({ message: 'Resource updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- DELETE resource ----
exports.deleteResource = async (req, res) => {
  try {
    const orgId = req.organization.id;
    const { id } = req.params;
    const [rows] = await pool.query('SELECT url FROM resources WHERE id = ? AND organization_id = ?', [id, orgId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    if (rows[0].url) {
      try {
        const parts = rows[0].url.split('/');
        const fileName = parts[parts.length - 1];
        const publicId = fileName.split('.')[0];
        const folder = parts[parts.length - 2] === 'organization-resources' ? 'organization-resources' : 'organization-resources';
        await deleteFromCloudinary(`chiyembekezo/${folder}/${publicId}`, 'image');
      } catch (delErr) {
        console.warn('Could not delete file from Cloudinary:', delErr);
      }
    }
    await pool.query('DELETE FROM resources WHERE id = ? AND organization_id = ?', [id, orgId]);
    await logAuditAction(req.user.id, 'org_admin', req.user.email, `Deleted resource ${id}`, 'resource', id);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
