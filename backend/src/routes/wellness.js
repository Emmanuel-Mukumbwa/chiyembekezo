const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');
const auth = require('../middleware/auth');

// Breathing
router.get('/breathing/types', auth, wellnessController.getBreathingTypes);
router.post('/breathing/complete', auth, wellnessController.completeBreathing);

// Meditation
router.get('/meditations', auth, wellnessController.getMeditations);
router.post('/meditation/complete', auth, wellnessController.completeMeditation);

// Grounding
router.get('/grounding/exercises', auth, wellnessController.getGroundingExercises);
router.post('/grounding/complete', auth, wellnessController.completeGrounding);

// Sounds
router.get('/sounds', auth, wellnessController.getSounds);

// Timers
router.get('/timers', auth, wellnessController.getTimers);

// Daily Wellness
router.get('/daily-wellness', auth, wellnessController.getDailyWellness);
router.post('/daily-wellness', auth, wellnessController.updateDailyWellness);

// Recommendations
router.get('/recommendations', auth, wellnessController.getRecommendations);

module.exports = router;