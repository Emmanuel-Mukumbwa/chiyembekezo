const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

router.get('/', auth, achievementController.getUserAchievements);
router.get('/earned', auth, achievementController.getEarnedAchievements);
router.get('/points', auth, achievementController.getUserPoints);

module.exports = router;