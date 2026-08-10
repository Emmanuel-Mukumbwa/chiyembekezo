const pool = require('../../config/db');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/upload');
const { logAuditAction } = require('../../services/auditLogService');

// Helper to get file buffer from multer's req.files
const getFileBuffer = (fileField) => (fileField && fileField[0] ? fileField[0].buffer : null);

// ---- Meditations ----
exports.getMeditations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM meditations ORDER BY sort_order, title');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createMeditation = async (req, res) => {
  try {
    const { title, category, duration, description, narrator, background_sound, sort_order } = req.body;
    let audio_url = null;
    let image_url = null;

    if (req.files && req.files.audio) {
      const buffer = getFileBuffer(req.files.audio);
      const result = await uploadToCloudinary(buffer, 'meditations', 'video', { resource_type: 'video' });
      audio_url = result.secure_url;
    }
    if (req.files && req.files.image) {
      const buffer = getFileBuffer(req.files.image);
      const result = await uploadToCloudinary(buffer, 'meditations', 'image');
      image_url = result.secure_url;
    }

    const [result] = await pool.query(
      `INSERT INTO meditations
       (title, category, duration, description, narrator, background_sound, audio_url, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, duration, description || null, narrator || null, background_sound || null, audio_url, image_url, sort_order || 0]
    );
    await logAuditAction(req.user.id, `Created meditation: ${title}`, 'meditation', result.insertId, {}, req.user.email);
    res.status(201).json({ message: 'Meditation created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateMeditation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, duration, description, narrator, background_sound, is_active, sort_order } = req.body;
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (duration !== undefined) { updates.push('duration = ?'); params.push(duration); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (narrator !== undefined) { updates.push('narrator = ?'); params.push(narrator); }
    if (background_sound !== undefined) { updates.push('background_sound = ?'); params.push(background_sound); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }

    // Audio upload
    if (req.files && req.files.audio) {
      const [old] = await pool.query('SELECT audio_url FROM meditations WHERE id = ?', [id]);
      if (old[0]?.audio_url) {
        const publicId = old[0].audio_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/meditations/${publicId}`, 'video').catch(() => {});
      }
      const buffer = getFileBuffer(req.files.audio);
      const result = await uploadToCloudinary(buffer, 'meditations', 'video', { resource_type: 'video' });
      updates.push('audio_url = ?');
      params.push(result.secure_url);
    }
    // Image upload
    if (req.files && req.files.image) {
      const [old] = await pool.query('SELECT image_url FROM meditations WHERE id = ?', [id]);
      if (old[0]?.image_url) {
        const publicId = old[0].image_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/meditations/${publicId}`, 'image').catch(() => {});
      }
      const buffer = getFileBuffer(req.files.image);
      const result = await uploadToCloudinary(buffer, 'meditations', 'image');
      updates.push('image_url = ?');
      params.push(result.secure_url);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    await pool.query(`UPDATE meditations SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAuditAction(req.user.id, `Updated meditation ${id}`, 'meditation', id, {}, req.user.email);
    res.json({ message: 'Meditation updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteMeditation = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT audio_url, image_url FROM meditations WHERE id = ?', [id]);
    if (rows.length > 0) {
      if (rows[0].audio_url) {
        const publicId = rows[0].audio_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/meditations/${publicId}`, 'video').catch(() => {});
      }
      if (rows[0].image_url) {
        const publicId = rows[0].image_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/meditations/${publicId}`, 'image').catch(() => {});
      }
    }
    await pool.query('DELETE FROM meditations WHERE id = ?', [id]);
    await logAuditAction(req.user.id, `Deleted meditation ${id}`, 'meditation', id, {}, req.user.email);
    res.json({ message: 'Meditation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---- Relaxation Sounds ----
exports.getSounds = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM relaxation_sounds ORDER BY sort_order, name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createSound = async (req, res) => {
  try {
    const { name, icon, color, sort_order } = req.body;
    let audio_url = null;
    let image_url = null;

    if (req.files && req.files.audio) {
      const buffer = getFileBuffer(req.files.audio);
      const result = await uploadToCloudinary(buffer, 'sounds', 'video', { resource_type: 'video' });
      audio_url = result.secure_url;
    }
    if (req.files && req.files.image) {
      const buffer = getFileBuffer(req.files.image);
      const result = await uploadToCloudinary(buffer, 'sounds', 'image');
      image_url = result.secure_url;
    }

    const [result] = await pool.query(
      `INSERT INTO relaxation_sounds (name, icon, color, audio_url, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, icon || null, color || null, audio_url, image_url, sort_order || 0]
    );
    await logAuditAction(req.user.id, `Created sound: ${name}`, 'sound', result.insertId, {}, req.user.email);
    res.status(201).json({ message: 'Sound created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSound = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, is_active, sort_order } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }

    if (req.files && req.files.audio) {
      const [old] = await pool.query('SELECT audio_url FROM relaxation_sounds WHERE id = ?', [id]);
      if (old[0]?.audio_url) {
        const publicId = old[0].audio_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/sounds/${publicId}`, 'video').catch(() => {});
      }
      const buffer = getFileBuffer(req.files.audio);
      const result = await uploadToCloudinary(buffer, 'sounds', 'video', { resource_type: 'video' });
      updates.push('audio_url = ?');
      params.push(result.secure_url);
    }
    if (req.files && req.files.image) {
      const [old] = await pool.query('SELECT image_url FROM relaxation_sounds WHERE id = ?', [id]);
      if (old[0]?.image_url) {
        const publicId = old[0].image_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/sounds/${publicId}`, 'image').catch(() => {});
      }
      const buffer = getFileBuffer(req.files.image);
      const result = await uploadToCloudinary(buffer, 'sounds', 'image');
      updates.push('image_url = ?');
      params.push(result.secure_url);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    await pool.query(`UPDATE relaxation_sounds SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAuditAction(req.user.id, `Updated sound ${id}`, 'sound', id, {}, req.user.email);
    res.json({ message: 'Sound updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSound = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT audio_url, image_url FROM relaxation_sounds WHERE id = ?', [id]);
    if (rows.length > 0) {
      if (rows[0].audio_url) {
        const publicId = rows[0].audio_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/sounds/${publicId}`, 'video').catch(() => {});
      }
      if (rows[0].image_url) {
        const publicId = rows[0].image_url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`chiyembekezo/sounds/${publicId}`, 'image').catch(() => {});
      }
    }
    await pool.query('DELETE FROM relaxation_sounds WHERE id = ?', [id]);
    await logAuditAction(req.user.id, `Deleted sound ${id}`, 'sound', id, {}, req.user.email);
    res.json({ message: 'Sound deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
