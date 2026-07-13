const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const auth = require('../middleware/auth');

router.get('/professional/:professionalId', availabilityController.getAvailability);
router.get('/professional/:professionalId/slots', availabilityController.getAvailableSlots);
router.put('/professional', auth, availabilityController.setAvailability);
router.delete('/professional/:id', auth, availabilityController.deleteAvailability);

module.exports = router;