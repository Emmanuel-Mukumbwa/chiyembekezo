const express = require('express');
const router = express.Router();
const { submitAssessment, getHistory } = require('../controllers/assessmentController');
const auth = require('../middleware/auth'); // we'll create this middleware

router.post('/submit', submitAssessment);
router.get('/history', auth, getHistory);

module.exports = router; 