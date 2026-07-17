const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');

router.get('/data', auth, emergencyController.getEmergencyData);

module.exports = router;