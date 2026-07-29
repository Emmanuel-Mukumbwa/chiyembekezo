const pool = require('../config/db');

// Helper to parse languages (could be JSON array or comma-separated string)
const parseLanguages = (lang) => {
  if (!lang) return [];
  if (typeof lang === 'string' && lang.startsWith('[')) {
    try { return JSON.parse(lang); } catch(e) { return lang.split(',').map(s => s.trim()); }
  }
  if (typeof lang === 'string') {
    return lang.split(',').map(s => s.trim());
  }
  return [];
};

// Get list of professionals with filters (PUBLIC)
exports.getProfessionals = async (req, res) => {
  try {
    const { district, language, specialty, availability, gender, search } = req.query;
    let conditions = ['p.is_verified = 1'];
    const params = [];

    if (district) {
      conditions.push('p.district = ?');
      params.push(district);
    }
    if (language) {
      // language is stored as JSON array, but we also support comma-separated string
      // We need to check if the language exists in the stored languages
      // For simplicity, we'll search using LIKE if not JSON
      conditions.push('p.languages LIKE ?');
      params.push(`%${language}%`);
    }
    if (specialty) {
      conditions.push('p.specialization LIKE ?');
      params.push(`%${specialty}%`);
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
    const professionals = rows.map(row => ({
      ...row,
      languages: parseLanguages(row.languages),
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

// Get single professional by ID (PUBLIC)
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
    pro.languages = parseLanguages(pro.languages);
    pro.available_days = pro.available_days ? JSON.parse(pro.available_days) : {};
    pro.avg_rating = pro.avg_rating ? parseFloat(pro.avg_rating).toFixed(1) : null;
    res.json(pro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get emergency contacts (PUBLIC) – now includes is_featured
exports.getEmergencyContacts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, phone, organization, district, contact_type, is_featured
      FROM emergency_contacts
      WHERE is_active = 1
      ORDER BY contact_type, name
    `);
    const grouped = {};
    const featured = [];
    rows.forEach(row => {
      if (!grouped[row.contact_type]) grouped[row.contact_type] = [];
      grouped[row.contact_type].push(row);
      if (row.is_featured) featured.push(row);
    });
    res.json({ grouped, featured });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
