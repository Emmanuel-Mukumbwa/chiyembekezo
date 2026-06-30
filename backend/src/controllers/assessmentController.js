const pool = require('../config/db');
const Assessment = require('../models/Assessment');

exports.submitAssessment = async (req, res) => {
  try {
    const { userId, type, answers } = req.body;
    const config = Assessment.getAssessment(type);
    if (!config) {
      return res.status(400).json({ error: 'Invalid assessment type' });
    }
    if (!answers || answers.length !== config.questions.length) {
      return res.status(400).json({ error: 'Invalid answers count' });
    }
    const score = Assessment.getScore(type, answers);
    const level = Assessment.getLevel(type, score);
    const recommendations = Assessment.getRecommendations(type, level.label);

    // Get or create assessment type id
    let typeIdResult = await pool.query('SELECT id FROM assessment_types WHERE name = ?', [type]);
    let typeId;
    if (typeIdResult[0].length === 0) {
      await pool.query('INSERT INTO assessment_types (name, description) VALUES (?, ?)', [type, config.name]);
      const newType = await pool.query('SELECT id FROM assessment_types WHERE name = ?', [type]);
      typeId = newType[0][0].id;
    } else {
      typeId = typeIdResult[0][0].id;
    }

    const query = `
      INSERT INTO assessment_results (user_id, assessment_type_id, score, severity_level, recommendations, taken_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await pool.query(query, [userId || null, typeId, score, level.label, JSON.stringify(recommendations)]);

    res.status(201).json({
      score,
      level: level.label,
      description: level.description,
      recommendations,
      type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT ar.score, ar.severity_level, ar.recommendations, ar.taken_at, at.name as assessment_type
      FROM assessment_results ar
      JOIN assessment_types at ON ar.assessment_type_id = at.id
      WHERE ar.user_id = ?
      ORDER BY ar.taken_at DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};