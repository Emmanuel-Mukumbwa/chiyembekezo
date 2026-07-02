const pool = require('../config/db');

// Get safety plan for a user (there is only one per user)
exports.getSafetyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT trusted_people, reasons_to_live, calming_things,
              emergency_contacts, safe_places, coping_skills
       FROM safety_plans
       WHERE user_id = ?`,
      [userId]
    );
    // Return empty object if not found
    if (rows.length === 0) {
      return res.json({
        trusted_people: '',
        reasons_to_live: '',
        calming_things: '',
        emergency_contacts: '',
        safe_places: '',
        coping_skills: '',
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create or update safety plan (upsert)
exports.saveSafetyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      trusted_people,
      reasons_to_live,
      calming_things,
      emergency_contacts,
      safe_places,
      coping_skills,
    } = req.body;

    // Check if plan exists
    const [existing] = await pool.query('SELECT id FROM safety_plans WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      // Update
      const query = `
        UPDATE safety_plans
        SET trusted_people = ?,
            reasons_to_live = ?,
            calming_things = ?,
            emergency_contacts = ?,
            safe_places = ?,
            coping_skills = ?
        WHERE user_id = ?
      `;
      await pool.query(query, [
        trusted_people || null,
        reasons_to_live || null,
        calming_things || null,
        emergency_contacts || null,
        safe_places || null,
        coping_skills || null,
        userId,
      ]);
    } else {
      // Insert
      const query = `
        INSERT INTO safety_plans
        (user_id, trusted_people, reasons_to_live, calming_things,
         emergency_contacts, safe_places, coping_skills)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(query, [
        userId,
        trusted_people || null,
        reasons_to_live || null,
        calming_things || null,
        emergency_contacts || null,
        safe_places || null,
        coping_skills || null,
      ]);
    }
    res.json({ message: 'Safety plan saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};