// backend/src/controllers/professionalController.js
const pool = require('../config/db');
const { logAuditAction } = require('../services/auditLogService');

// Get list of professionals with filters
exports.getProfessionals = async (req, res) => {
  try {
    const { district, language, specialty, availability, gender, search } = req.query;
    let conditions = ['p.is_verified = 1']; // only show verified
    const params = [];

    if (district) {
      conditions.push('p.district = ?');
      params.push(district);
    }
    if (language) {
      conditions.push(`JSON_CONTAINS(p.languages, ?)`);
      params.push(`"${language}"`);
    }
    if (specialty) {
      conditions.push('p.specialization LIKE ?');
      params.push(`%${specialty}%`);
    }
    if (availability) {
      // availability can be "today" or a day of week; we'll store days JSON: {"monday": ["09:00-17:00"]}
      // For simplicity, we'll check if any day has a schedule.
      // For MVP, we just show all verified professionals.
      // Could expand later.
    }
    if (gender) {
      conditions.push('u.gender = ?');
      params.push(gender);
    }
    if (search) {
      conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR p.specialization LIKE ? OR p.clinic_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const query = `
      SELECT p.id, u.id as user_id, u.first_name, u.last_name, u.phone, u.email,
             p.license_number, p.specialization, p.years_experience,
             p.clinic_name, p.clinic_address, p.district, p.city,
             p.is_verified, p.consultation_fee, p.bio, p.languages, p.available_days,
             p.created_at,
             (SELECT AVG(rating) FROM appointments WHERE professional_id = p.id AND rating IS NOT NULL) as avg_rating,
             (SELECT COUNT(*) FROM appointments WHERE professional_id = p.id AND status = 'completed') as completed_sessions
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.is_verified DESC, p.created_at DESC
    `;
    const [rows] = await pool.query(query, params);
    // Parse JSON fields
    const professionals = rows.map(row => ({
      ...row,
      languages: row.languages ? JSON.parse(row.languages) : [],
      available_days: row.available_days ? JSON.parse(row.available_days) : {},
      avg_rating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : null,
      completed_sessions: row.completed_sessions || 0,
    }));
    res.json(professionals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single professional by ID
exports.getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.id, u.id as user_id, u.first_name, u.last_name, u.phone, u.email,
             p.license_number, p.specialization, p.years_experience,
             p.clinic_name, p.clinic_address, p.district, p.city,
             p.is_verified, p.consultation_fee, p.bio, p.languages, p.available_days,
             p.created_at,
             (SELECT AVG(rating) FROM appointments WHERE professional_id = p.id AND rating IS NOT NULL) as avg_rating,
             (SELECT COUNT(*) FROM appointments WHERE professional_id = p.id AND status = 'completed') as completed_sessions
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Professional not found' });
    }
    const pro = rows[0];
    pro.languages = pro.languages ? JSON.parse(pro.languages) : [];
    pro.available_days = pro.available_days ? JSON.parse(pro.available_days) : {};
    pro.avg_rating = pro.avg_rating ? parseFloat(pro.avg_rating).toFixed(1) : null;
    res.json(pro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get emergency contacts (hospitals, helplines, NGOs)
exports.getEmergencyContacts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, phone, organization, district, contact_type
      FROM emergency_contacts
      WHERE is_active = 1
      ORDER BY contact_type, name
    `);
    // group by type
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.contact_type]) grouped[row.contact_type] = [];
      grouped[row.contact_type].push(row);
    });
    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};