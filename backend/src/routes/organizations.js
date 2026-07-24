const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// Public route to get organization by ID (for registration page)
router.get('/:id', organizationController.getOrganizationById);

module.exports = router;