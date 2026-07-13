const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// All routes require authentication
router.post('/', auth, appointmentController.bookAppointment);
router.get('/my', auth, appointmentController.getMyAppointments);
router.put('/:id/cancel', auth, appointmentController.cancelAppointment);
router.put('/:id/rate', auth, appointmentController.rateAppointment);
router.put('/:id/reschedule', auth, appointmentController.rescheduleAppointment);

module.exports = router;