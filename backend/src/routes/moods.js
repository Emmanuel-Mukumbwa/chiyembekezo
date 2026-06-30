//src/routes/mood.js
const express = require('express');
const router = express.Router();
const { saveMood, getMoodHistory } = require('../controllers/moodController');
const auth = require('../middleware/auth');

router.post('/', auth, saveMood);
router.get('/history', auth, getMoodHistory);

module.exports = router;