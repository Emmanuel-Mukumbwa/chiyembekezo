const pool = require('../config/db');

// Get all emergency data for the user
exports.getEmergencyData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user profile emergency contacts
    const [profileRows] = await pool.query(
      `SELECT emergency_contact_name, emergency_contact_phone
       FROM profiles WHERE user_id = ?`,
      [userId]
    );
    const profileContacts = profileRows.length > 0 ? {
      name: profileRows[0].emergency_contact_name,
      phone: profileRows[0].emergency_contact_phone,
    } : null;

    // 2. Get safety plan trusted people and emergency numbers
    const [safetyRows] = await pool.query(
      `SELECT trusted_people, emergency_numbers
       FROM safety_plans WHERE user_id = ?`,
      [userId]
    );
    const safetyContacts = safetyRows.length > 0 ? {
      trusted_people: safetyRows[0].trusted_people,
      emergency_numbers: safetyRows[0].emergency_numbers,
    } : null;

    // 3. Get system emergency contacts (hospitals, helplines, etc.)
    const [systemContacts] = await pool.query(
      `SELECT id, name, phone, organization, district, contact_type
       FROM emergency_contacts
       WHERE is_active = 1
       ORDER BY contact_type, name`
    );

    // Group system contacts by type
    const grouped = {};
    systemContacts.forEach(row => {
      if (!grouped[row.contact_type]) grouped[row.contact_type] = [];
      grouped[row.contact_type].push(row);
    });

    res.json({
      profileContacts,
      safetyContacts,
      systemContacts: grouped,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};