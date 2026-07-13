const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const auth = require('../middleware/auth');

router.get('/', auth, habitController.getHabits);
router.post('/', auth, habitController.createHabit);
router.put('/:id', auth, habitController.updateHabit);
router.delete('/:id', auth, habitController.deleteHabit);

router.post('/log', auth, habitController.logHabit);
router.get('/:habitId/logs', auth, habitController.getHabitLogs);
router.get('/today/logs', auth, habitController.getTodayLogs);

// Templates & Achievements
router.get('/templates', auth, habitController.getGoalTemplates);
router.get('/achievements', auth, habitController.getAchievements);

module.exports = router;