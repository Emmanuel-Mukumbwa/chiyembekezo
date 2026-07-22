const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isProfessional = require('../middleware/isProfessional');

// Import controllers
const appointmentController = require('../controllers/professional/appointmentController');
const messageController = require('../controllers/professional/messageController');
const reportController = require('../controllers/professional/reportController');
const availabilityController = require('../controllers/availabilityController'); // reuse existing

router.use(auth, isProfessional);

// Appointments
router.get('/appointments/upcoming', appointmentController.getUpcoming);
router.get('/appointments/past', appointmentController.getPast);
router.get('/appointments/patient/:patientId', appointmentController.getPatientHistory);
router.put('/appointments/:id/status', appointmentController.updateStatus);
router.post('/appointments/:id/note', appointmentController.addNote);

// Messages
router.get('/messages/conversations', messageController.getConversations);
router.get('/messages/patient/:patientId', messageController.getMessages);
router.post('/messages', messageController.sendMessage);

// Reports
router.get('/reports/stats', reportController.getStats);

// Availability (reuse existing)
router.get('/availability', availabilityController.getAvailability);
router.put('/availability', availabilityController.setAvailability);
router.delete('/availability/:id', availabilityController.deleteAvailability);

module.exports = router;