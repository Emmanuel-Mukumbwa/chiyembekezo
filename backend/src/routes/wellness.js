const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');
const auth = require('../middleware/auth');

// Breathing
router.get('/breathing/types', auth, wellnessController.getBreathingTechniques);
router.post('/breathing/complete', auth, (req, res) => {
  req.body.session_type = 'breathing';
  wellnessController.saveSession(req, res);
});

// Meditation
router.get('/meditations', auth, wellnessController.getMeditations);
router.post('/meditation/complete', auth, (req, res) => {
  req.body.session_type = 'meditation';
  wellnessController.saveSession(req, res);
});

// Grounding
router.get('/grounding/exercises', auth, wellnessController.getGroundingExercises);
router.post('/grounding/complete', auth, (req, res) => {
  req.body.session_type = 'grounding';
  wellnessController.saveSession(req, res);
});

// Sounds
router.get('/sounds', auth, wellnessController.getSounds);

// Timers (placeholder)
router.get('/timers', auth, (req, res) => {
  res.json({ message: 'Timer presets' });
});

// Daily Wellness
router.get('/daily-wellness', auth, wellnessController.getDailyWellness);
router.post('/daily-wellness', auth, wellnessController.saveDailyWellness);

// Recommendations (placeholder)
router.get('/recommendations', auth, (req, res) => {
  res.json([]);
});

module.exports = router;
