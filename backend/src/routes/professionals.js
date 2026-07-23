// backend/src/routes/professionals.js
const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');
const auth = require('../middleware/auth');

// Public (or protected) routes
router.get('/', professionalController.getProfessionals);
router.get('/:id', professionalController.getProfessionalById);
router.get('/emergency/contacts', professionalController.getEmergencyContacts);

module.exports = router; 